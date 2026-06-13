#!/usr/bin/env python3
"""Træna Arctic Fishing — booking backend + admin (prototype).

Dependency-free: Python standard library only. Run with:

    python3 app.py            # serves on http://localhost:8787

Stores bookings in bookings.db (SQLite, created automatically).
Admin page at /admin (HTTP Basic auth — see ADMIN_USER / ADMIN_PASS below).

This is a working prototype. Payment (Stripe/Vipps) and real email sending are
deliberately NOT wired here — those need the camp's own accounts (see README).
When a booking comes in, the camp is notified in the admin with a ready-made,
honest "please block these dates" email to DinTur. Nothing is sent to DinTur
automatically.
"""
import json
import os
import sqlite3
import base64
import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

PORT = int(os.environ.get("PORT", "8787"))
DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bookings.db")
ADMIN_USER = os.environ.get("ADMIN_USER", "camp")
ADMIN_PASS = os.environ.get("ADMIN_PASS", "traena")  # CHANGE THIS before real use
DINTUR_NOTIFY_TO = os.environ.get("DINTUR_EMAIL", "post@dintur.no")

UNITS = [
    ("apartment", "Grønnrevet", "gronnrevet"),
    ("apartment", "Nargtind", "nargtind"),
    ("apartment", "Svanen", "svanen"),
    ("apartment", "Sandflæsa", "sandflaesa"),
    ("apartment", "Selværgutt", "selvaergutt"),
    ("apartment", "Vegardbryggen", "vegardbryggen"),
    ("boat", "Båt 1", "bat-1"),
    ("boat", "Båt 2", "bat-2"),
    ("boat", "Båt 3", "bat-3"),
    ("boat", "Båt 4", "bat-4"),
    ("boat", "Båt 5", "bat-5"),
    ("boat", "Båt 6", "bat-6"),
    ("boat", "Båt 7", "bat-7"),
]


def db():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con


def init_db():
    con = db()
    con.execute("""CREATE TABLE IF NOT EXISTS units(
        slug TEXT PRIMARY KEY, kind TEXT, name TEXT)""")
    con.execute("""CREATE TABLE IF NOT EXISTS bookings(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kind TEXT, unit_slug TEXT, unit_name TEXT,
        from_date TEXT, to_date TEXT,
        name TEXT, email TEXT, phone TEXT, guests INTEGER,
        message TEXT, status TEXT DEFAULT 'pending',
        created_at TEXT)""")
    for kind, name, slug in UNITS:
        con.execute("INSERT OR IGNORE INTO units(slug,kind,name) VALUES(?,?,?)",
                    (slug, kind, name))
    con.commit()
    con.close()


def overlaps(unit_slug, frm, to, exclude_id=None):
    """A booking blocks [from, to). Returns True if the range overlaps an
    existing non-cancelled booking for the same unit."""
    con = db()
    q = ("SELECT COUNT(*) c FROM bookings WHERE unit_slug=? AND status!='cancelled' "
         "AND from_date < ? AND to_date > ?")
    args = [unit_slug, to, frm]
    if exclude_id:
        q += " AND id!=?"; args.append(exclude_id)
    c = con.execute(q, args).fetchone()["c"]
    con.close()
    return c > 0


def valid_dates(frm, to):
    try:
        d1 = datetime.date.fromisoformat(frm)
        d2 = datetime.date.fromisoformat(to)
    except Exception:
        return False
    return d2 > d1 and d1 >= datetime.date.today()


def dintur_email_text(b):
    """Honest message the camp can forward to DinTur to block the dates.
    States the truth: the unit is now unavailable for these dates."""
    return (
        f"Til DinTur,\n\n"
        f"Følgende enhet er nå opptatt og må settes som utilgjengelig:\n\n"
        f"  Enhet: {b['unit_name']}\n"
        f"  Periode: {b['from_date']} til {b['to_date']}\n\n"
        f"Vennligst sperr disse datoene i kalenderen.\n\n"
        f"Mvh,\nTræna Arctic Fishing"
    )


class H(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="application/json", extra=None):
        if isinstance(body, (dict, list)):
            body = json.dumps(body, ensure_ascii=False).encode("utf-8")
        elif isinstance(body, str):
            body = body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        for k, v in (extra or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def _auth_ok(self):
        h = self.headers.get("Authorization", "")
        if not h.startswith("Basic "):
            return False
        try:
            user, _, pw = base64.b64decode(h[6:]).decode().partition(":")
        except Exception:
            return False
        return user == ADMIN_USER and pw == ADMIN_PASS

    def _need_auth(self):
        self._send(401, {"error": "auth required"},
                   extra={"WWW-Authenticate": 'Basic realm="admin"'})

    def log_message(self, *a):  # quieter
        pass

    def do_OPTIONS(self):
        self._send(204, b"", ctype="text/plain")

    def do_GET(self):
        u = urlparse(self.path)
        q = parse_qs(u.query)
        if u.path == "/api/units":
            con = db()
            rows = [dict(r) for r in con.execute("SELECT * FROM units ORDER BY kind DESC, name")]
            con.close()
            return self._send(200, rows)
        if u.path == "/api/availability":
            slug = (q.get("unit") or [""])[0]
            frm = (q.get("from") or [""])[0]
            to = (q.get("to") or [""])[0]
            if not slug or not valid_dates(frm, to):
                return self._send(400, {"error": "ugyldige datoer eller enhet"})
            return self._send(200, {"available": not overlaps(slug, frm, to)})
        if u.path == "/api/admin/bookings":
            if not self._auth_ok():
                return self._need_auth()
            con = db()
            rows = [dict(r) for r in con.execute("SELECT * FROM bookings ORDER BY from_date")]
            con.close()
            return self._send(200, rows)
        if u.path in ("/admin", "/admin/"):
            if not self._auth_ok():
                return self._need_auth()
            return self._send(200, admin_html(), ctype="text/html")
        if u.path in ("/", "/health"):
            return self._send(200, {"ok": True, "service": "traena-booking"})
        return self._send(404, {"error": "not found"})

    def do_POST(self):
        u = urlparse(self.path)
        if u.path != "/api/bookings":
            return self._send(404, {"error": "not found"})
        length = int(self.headers.get("Content-Length", "0"))
        try:
            data = json.loads(self.rfile.read(length) or "{}")
        except Exception:
            return self._send(400, {"error": "ugyldig JSON"})

        slug = (data.get("unit") or "").strip()
        frm = (data.get("from") or "").strip()
        to = (data.get("to") or "").strip()
        name = (data.get("name") or "").strip()
        email = (data.get("email") or "").strip()
        if not (slug and name and email and valid_dates(frm, to)):
            return self._send(400, {"error": "mangler felt eller ugyldige datoer"})

        con = db()
        unit = con.execute("SELECT * FROM units WHERE slug=?", (slug,)).fetchone()
        if not unit:
            con.close()
            return self._send(400, {"error": "ukjent enhet"})
        if overlaps(slug, frm, to):
            con.close()
            return self._send(409, {"error": "opptatt", "available": False})

        cur = con.execute(
            """INSERT INTO bookings(kind,unit_slug,unit_name,from_date,to_date,
               name,email,phone,guests,message,status,created_at)
               VALUES(?,?,?,?,?,?,?,?,?,?, 'pending', ?)""",
            (unit["kind"], slug, unit["name"], frm, to, name, email,
             data.get("phone", ""), int(data.get("guests") or 0),
             data.get("message", ""), datetime.datetime.now().isoformat(timespec="seconds")))
        con.commit()
        bid = cur.lastrowid
        b = dict(con.execute("SELECT * FROM bookings WHERE id=?", (bid,)).fetchone())
        con.close()

        # Honest notification for the camp (NOT auto-sent to DinTur).
        print(f"[NY BOOKING #{bid}] {b['unit_name']} {frm}->{to} — {name} <{email}>")
        print("  → Husk å sperre disse datoene på DinTur. Ferdig e-post ligger i admin.")
        return self._send(201, {"ok": True, "id": bid,
                                 "dintur_email_to": DINTUR_NOTIFY_TO,
                                 "dintur_email": dintur_email_text(b)})


def admin_html():
    con = db()
    rows = [dict(r) for r in con.execute("SELECT * FROM bookings ORDER BY from_date")]
    con.close()
    today = datetime.date.today().isoformat()
    items = ""
    if not rows:
        items = '<tr><td colspan="6" class="muted">Ingen bookinger ennå.</td></tr>'
    for b in rows:
        upcoming = b["to_date"] >= today
        mailto = (f"mailto:{DINTUR_NOTIFY_TO}?subject="
                  f"Sperr%20datoer%20-%20{b['unit_name']}&body="
                  + dintur_email_text(b).replace("\n", "%0A").replace(" ", "%20"))
        items += f"""<tr class="{'up' if upcoming else 'past'}">
          <td><b>{b['unit_name']}</b><span class="kind">{b['kind']}</span></td>
          <td>{b['from_date']} → {b['to_date']}</td>
          <td>{b['name']}<br><span class="muted">{b['email']} {b['phone'] or ''}</span></td>
          <td>{b['guests'] or '—'}</td>
          <td><span class="status s-{b['status']}">{b['status']}</span></td>
          <td><a class="btn" href="{mailto}">Sperr på DinTur ✉</a></td>
        </tr>"""
    return f"""<!DOCTYPE html><html lang="no"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Admin — Træna Arctic Fishing</title>
<style>
  :root{{--ocean:#0d2b39;--deep:#07171f;--gold:#e7b169;--foam:#f3f6f5;--slate:#8aa3a8}}
  body{{margin:0;font-family:system-ui,sans-serif;background:var(--deep);color:var(--foam)}}
  header{{padding:1.2rem 1.5rem;border-bottom:1px solid rgba(255,255,255,.08);display:flex;
    align-items:center;gap:1rem}}
  header h1{{font-size:1.2rem;margin:0}} .badge{{background:var(--gold);color:#07171f;
    border-radius:999px;padding:.2rem .7rem;font-size:.8rem;font-weight:700}}
  .wrap{{padding:1.5rem;max-width:1100px;margin:0 auto}}
  table{{width:100%;border-collapse:collapse;font-size:.92rem}}
  th,td{{text-align:left;padding:.7rem .6rem;border-bottom:1px solid rgba(255,255,255,.07);
    vertical-align:top}}
  th{{color:var(--slate);font-weight:600;font-size:.78rem;text-transform:uppercase;letter-spacing:.05em}}
  tr.past{{opacity:.5}} .kind{{display:block;color:var(--slate);font-size:.75rem}}
  .muted{{color:var(--slate)}} .status{{padding:.2rem .6rem;border-radius:999px;font-size:.78rem}}
  .s-pending{{background:rgba(231,177,105,.2);color:var(--gold)}}
  .s-confirmed{{background:rgba(80,200,120,.2);color:#7fe0a0}}
  .s-cancelled{{background:rgba(255,90,90,.15);color:#ff9a9a}}
  .btn{{background:rgba(231,177,105,.15);color:var(--gold);text-decoration:none;
    padding:.4rem .7rem;border-radius:8px;font-size:.82rem;white-space:nowrap}}
  .note{{background:var(--ocean);border:1px solid rgba(255,255,255,.08);border-radius:12px;
    padding:1rem 1.2rem;margin-bottom:1.4rem;color:var(--slate);font-size:.9rem}}
</style></head><body>
<header><h1>🎣 Træna Arctic Fishing</h1><span class="badge">Admin</span>
  <span class="muted" style="margin-left:auto">{len(rows)} bookinger</span></header>
<div class="wrap">
  <div class="note">Når en booking kommer inn: trykk <b>«Sperr på DinTur ✉»</b> for å
  åpne en ferdig, sannferdig e-post til DinTur — eller sperr datoene i DinTurs eier-portal.
  Slik holdes de to i sync uten dobbeltbooking.</div>
  <table>
    <thead><tr><th>Enhet</th><th>Periode</th><th>Gjest</th><th>Ant.</th>
      <th>Status</th><th>DinTur</th></tr></thead>
    <tbody>{items}</tbody>
  </table>
</div></body></html>"""


if __name__ == "__main__":
    init_db()
    print(f"Træna booking-backend → http://localhost:{PORT}  (admin: /admin, {ADMIN_USER}/{ADMIN_PASS})")
    ThreadingHTTPServer(("0.0.0.0", PORT), H).serve_forever()
