#!/usr/bin/env python3
"""Træna Arctic Fishing — booking backend + admin (prototype).

Dependency-free: Python standard library only. Run with:

    python3 app.py            # serves on http://localhost:8787

Stores bookings in bookings.db (SQLite, created automatically).
Admin page at /admin (HTTP Basic auth — see ADMIN_USER / ADMIN_PASS below):
calendar timeline + booking list with confirm/cancel + ready-made emails.

Payment (Stripe/Vipps) and real email SENDING are deliberately NOT wired here —
those need the camp's own accounts (see README). Nothing is sent to DinTur
automatically; the admin gives the camp an honest "please block these dates"
email to forward.
"""
import json
import os
import sqlite3
import base64
import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, quote

PORT = int(os.environ.get("PORT", "8787"))
DB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "bookings.db")
ADMIN_USER = os.environ.get("ADMIN_USER", "camp")
ADMIN_PASS = os.environ.get("ADMIN_PASS", "traena")  # CHANGE THIS before real use
DINTUR_NOTIFY_TO = os.environ.get("DINTUR_EMAIL", "post@dintur.no")
TIMELINE_DAYS = 84  # ~12 weeks shown in the admin calendar

# kind, name, slug, weekly price (NOK) — real "from" prices from DinTur
UNITS = [
    ("apartment", "Grønnrevet", "gronnrevet", 18122),
    ("apartment", "Nargtind", "nargtind", 18122),
    ("apartment", "Svanen", "svanen", 18122),
    ("apartment", "Sandflæsa", "sandflaesa", 18122),
    ("apartment", "Selværgutt", "selvaergutt", 18959),
    ("apartment", "Vegardbryggen", "vegardbryggen", 14306),
    ("boat", "Båt 1", "bat-1", 10548),
    ("boat", "Båt 2", "bat-2", 9988),
    ("boat", "Båt 3", "bat-3", 9988),
    ("boat", "Båt 4", "bat-4", 9988),
    ("boat", "Båt 5", "bat-5", 9988),
    ("boat", "Båt 6", "bat-6", 9988),
    ("boat", "Båt 7", "bat-7", 10831),
]


def db():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con


def init_db():
    con = db()
    con.execute("""CREATE TABLE IF NOT EXISTS units(
        slug TEXT PRIMARY KEY, kind TEXT, name TEXT, price INTEGER DEFAULT 0)""")
    # tolerate older DBs without the price column
    cols = [r["name"] for r in con.execute("PRAGMA table_info(units)")]
    if "price" not in cols:
        con.execute("ALTER TABLE units ADD COLUMN price INTEGER DEFAULT 0")
    con.execute("""CREATE TABLE IF NOT EXISTS bookings(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kind TEXT, unit_slug TEXT, unit_name TEXT,
        from_date TEXT, to_date TEXT,
        name TEXT, email TEXT, phone TEXT, guests INTEGER,
        message TEXT, status TEXT DEFAULT 'pending', price INTEGER DEFAULT 0,
        created_at TEXT)""")
    if "price" not in [r["name"] for r in con.execute("PRAGMA table_info(bookings)")]:
        con.execute("ALTER TABLE bookings ADD COLUMN price INTEGER DEFAULT 0")
    for kind, name, slug, price in UNITS:
        con.execute("INSERT INTO units(slug,kind,name,price) VALUES(?,?,?,?) "
                    "ON CONFLICT(slug) DO UPDATE SET kind=?,name=?,price=?",
                    (slug, kind, name, price, kind, name, price))
    con.commit()
    con.close()


def overlaps(unit_slug, frm, to, exclude_id=None):
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


def nights(frm, to):
    return (datetime.date.fromisoformat(to) - datetime.date.fromisoformat(frm)).days


def estimate_price(weekly, frm, to):
    return round(weekly * nights(frm, to) / 7) if weekly else 0


def nok(n):
    return "kr " + format(int(n), ",d").replace(",", " ")


def dintur_email_text(b):
    return (f"Til DinTur,\n\nFølgende enhet er nå opptatt og må settes som utilgjengelig:\n\n"
            f"  Enhet: {b['unit_name']}\n  Periode: {b['from_date']} til {b['to_date']}\n\n"
            f"Vennligst sperr disse datoene i kalenderen.\n\nMvh,\nTræna Arctic Fishing")


def guest_email_text(b):
    return (f"Hei {b['name']},\n\nTakk for bestillingen hos Træna Arctic Fishing!\n\n"
            f"  {b['unit_name']}\n  {b['from_date']} til {b['to_date']}\n"
            f"  Pris: {nok(b['price'])}\n\n"
            f"Vi bekrefter med dette plassen. Gi oss et vink om du lurer på noe.\n\n"
            f"Vi gleder oss til å se deg på Selvær!\nMvh,\nTræna Arctic Fishing\n"
            f"+47 908 46 461 · traenaarctic@gmail.com")


def mailto(to, subject, body):
    return f"mailto:{to}?subject={quote(subject)}&body={quote(body)}"


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
        if body:
            self.wfile.write(body)

    def _redirect(self, to):
        self.send_response(302)
        self.send_header("Location", to)
        self.end_headers()

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

    def log_message(self, *a):
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
            con = db()
            unit = con.execute("SELECT * FROM units WHERE slug=?", (slug,)).fetchone()
            con.close()
            price = estimate_price(unit["price"] if unit else 0, frm, to)
            return self._send(200, {"available": not overlaps(slug, frm, to),
                                    "price": price, "nights": nights(frm, to)})
        if u.path == "/api/admin/bookings":
            if not self._auth_ok():
                return self._need_auth()
            con = db()
            rows = [dict(r) for r in con.execute("SELECT * FROM bookings ORDER BY from_date")]
            con.close()
            return self._send(200, rows)
        # admin status actions (GET so browser resends cached Basic auth)
        if u.path.startswith("/admin/booking/"):
            if not self._auth_ok():
                return self._need_auth()
            parts = u.path.strip("/").split("/")  # admin booking <id> <action>
            if len(parts) == 4 and parts[3] in ("confirm", "cancel", "pending"):
                new = {"confirm": "confirmed", "cancel": "cancelled", "pending": "pending"}[parts[3]]
                con = db()
                con.execute("UPDATE bookings SET status=? WHERE id=?", (new, int(parts[2])))
                con.commit(); con.close()
            return self._redirect("/admin")
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
            con.close(); return self._send(400, {"error": "ukjent enhet"})
        if overlaps(slug, frm, to):
            con.close(); return self._send(409, {"error": "opptatt", "available": False})
        price = estimate_price(unit["price"], frm, to)
        cur = con.execute(
            """INSERT INTO bookings(kind,unit_slug,unit_name,from_date,to_date,name,email,
               phone,guests,message,status,price,created_at)
               VALUES(?,?,?,?,?,?,?,?,?,?, 'pending', ?, ?)""",
            (unit["kind"], slug, unit["name"], frm, to, name, email, data.get("phone", ""),
             int(data.get("guests") or 0), data.get("message", ""), price,
             datetime.datetime.now().isoformat(timespec="seconds")))
        con.commit(); bid = cur.lastrowid; con.close()
        print(f"[NY BOOKING #{bid}] {unit['name']} {frm}->{to} — {name} <{email}> ({nok(price)})")
        print("  → Husk å sperre datoene på DinTur (ferdig e-post i admin).")
        return self._send(201, {"ok": True, "id": bid, "price": price})


# ---------------- admin page ----------------
def admin_html():
    con = db()
    bookings = [dict(r) for r in con.execute("SELECT * FROM bookings ORDER BY from_date")]
    units = [dict(r) for r in con.execute("SELECT * FROM units ORDER BY kind DESC, name")]
    con.close()
    today = datetime.date.today()
    days = [today + datetime.timedelta(days=i) for i in range(TIMELINE_DAYS)]

    # map unit -> {date_iso: status}
    booked = {u["slug"]: {} for u in units}
    for b in bookings:
        if b["status"] == "cancelled":
            continue
        d = datetime.date.fromisoformat(b["from_date"])
        end = datetime.date.fromisoformat(b["to_date"])
        while d < end:
            booked[b["unit_slug"]][d.isoformat()] = b["status"]
            d += datetime.timedelta(days=1)

    # month header spanning the days
    month_hdr = ""
    i = 0
    while i < len(days):
        m = days[i].month
        span = sum(1 for d in days[i:] if d.month == m)
        month_hdr += f"<th colspan='{span}' class='mh'>{days[i].strftime('%b %Y')}</th>"
        i += span

    rows = ""
    last_kind = None
    for u in units:
        if u["kind"] != last_kind:
            label = "Leiligheter" if u["kind"] == "apartment" else "Båter"
            rows += f"<tr class='grp'><td class='ulabel'>{label}</td>" + \
                    f"<td colspan='{len(days)}'></td></tr>"
            last_kind = u["kind"]
        cells = ""
        for d in days:
            st = booked[u["slug"]].get(d.isoformat())
            cls = "c"
            if d.weekday() == 6:
                cls += " sun"
            if st == "confirmed":
                cls += " bk-conf"
            elif st == "pending":
                cls += " bk-pend"
            cells += f"<td class='{cls}' title='{d.isoformat()}'></td>"
        rows += f"<tr><td class='ulabel'>{u['name']}<span class='pr'>{nok(u['price'])}/uke</span></td>{cells}</tr>"

    # booking list
    items = ""
    if not bookings:
        items = '<tr><td colspan="6" class="muted">Ingen bookinger ennå.</td></tr>'
    for b in bookings:
        upcoming = b["to_date"] >= today.isoformat()
        dintur = mailto(DINTUR_NOTIFY_TO, f"Sperr datoer – {b['unit_name']}", dintur_email_text(b))
        guest = mailto(b["email"], "Bekreftelse – Træna Arctic Fishing", guest_email_text(b))
        actions = (f"<a class='btn' href='{dintur}'>Sperr DinTur ✉</a>"
                   f"<a class='btn' href='{guest}'>Bekreft gjest ✉</a>")
        if b["status"] != "confirmed":
            actions += f"<a class='btn ok' href='/admin/booking/{b['id']}/confirm'>✔ Bekreft</a>"
        if b["status"] != "cancelled":
            actions += f"<a class='btn no' href='/admin/booking/{b['id']}/cancel'>✕ Avlys</a>"
        else:
            actions += f"<a class='btn' href='/admin/booking/{b['id']}/pending'>↺ Gjenåpne</a>"
        items += f"""<tr class="{'up' if upcoming else 'past'}">
          <td><b>{b['unit_name']}</b><span class="kind">{b['kind']}</span></td>
          <td>{b['from_date']} → {b['to_date']}<span class="kind">{nok(b['price'])}</span></td>
          <td>{b['name']}<br><span class="muted">{b['email']} {b['phone'] or ''}</span></td>
          <td>{b['guests'] or '—'}</td>
          <td><span class="status s-{b['status']}">{b['status']}</span></td>
          <td class="act">{actions}</td></tr>"""

    return f"""<!DOCTYPE html><html lang="no"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Admin — Træna Arctic Fishing</title>
<style>
  :root{{--ocean:#0d2b39;--deep:#07171f;--gold:#e7b169;--foam:#f3f6f5;--slate:#8aa3a8;
    --green:#7fe0a0;--red:#ff9a9a}}
  *{{box-sizing:border-box}}
  body{{margin:0;font-family:system-ui,sans-serif;background:var(--deep);color:var(--foam)}}
  header{{padding:1.1rem 1.5rem;border-bottom:1px solid rgba(255,255,255,.08);display:flex;
    align-items:center;gap:1rem}}
  header h1{{font-size:1.15rem;margin:0}}
  .badge{{background:var(--gold);color:#07171f;border-radius:999px;padding:.2rem .7rem;
    font-size:.8rem;font-weight:700}}
  .wrap{{padding:1.4rem;max-width:1200px;margin:0 auto}}
  h2{{font-size:1rem;color:var(--slate);text-transform:uppercase;letter-spacing:.06em;
    margin:1.8rem 0 .8rem}}
  .legend{{display:flex;gap:1.2rem;font-size:.82rem;color:var(--slate);margin-bottom:.6rem}}
  .legend span{{display:inline-flex;align-items:center;gap:.4rem}}
  .sw{{width:14px;height:14px;border-radius:3px;display:inline-block}}
  .sw.p{{background:var(--gold)}} .sw.c{{background:var(--green)}}
  .cal-scroll{{overflow-x:auto;border:1px solid rgba(255,255,255,.08);border-radius:10px}}
  table.cal{{border-collapse:collapse}}
  table.cal td,table.cal th{{padding:0}}
  .mh{{font-size:.72rem;color:var(--slate);text-align:left;padding:.3rem .4rem;font-weight:600;
    border-left:1px solid rgba(255,255,255,.12)}}
  td.ulabel,th.ulabel{{position:sticky;left:0;background:var(--deep);min-width:150px;
    padding:.35rem .6rem;font-size:.85rem;white-space:nowrap;border-right:1px solid rgba(255,255,255,.12)}}
  .pr{{display:block;color:var(--slate);font-size:.7rem}}
  td.c{{width:11px;height:26px;border-right:1px solid rgba(255,255,255,.05);
    border-bottom:1px solid rgba(255,255,255,.05)}}
  td.c.sun{{border-right:1px solid rgba(255,255,255,.18)}}
  td.bk-pend{{background:var(--gold)}} td.bk-conf{{background:var(--green)}}
  tr.grp td{{background:rgba(255,255,255,.03);font-size:.72rem;color:var(--slate);
    text-transform:uppercase;letter-spacing:.05em;padding:.3rem .6rem}}
  table.list{{width:100%;border-collapse:collapse;font-size:.9rem;margin-top:.4rem}}
  table.list th,table.list td{{text-align:left;padding:.7rem .6rem;
    border-bottom:1px solid rgba(255,255,255,.07);vertical-align:top}}
  table.list th{{color:var(--slate);font-weight:600;font-size:.74rem;text-transform:uppercase;
    letter-spacing:.05em}}
  tr.past{{opacity:.5}} .kind{{display:block;color:var(--slate);font-size:.72rem}}
  .muted{{color:var(--slate)}}
  .status{{padding:.2rem .55rem;border-radius:999px;font-size:.76rem}}
  .s-pending{{background:rgba(231,177,105,.2);color:var(--gold)}}
  .s-confirmed{{background:rgba(127,224,160,.18);color:var(--green)}}
  .s-cancelled{{background:rgba(255,90,90,.15);color:var(--red)}}
  .act{{display:flex;flex-wrap:wrap;gap:.35rem}}
  .btn{{background:rgba(231,177,105,.14);color:var(--gold);text-decoration:none;
    padding:.32rem .6rem;border-radius:7px;font-size:.78rem;white-space:nowrap}}
  .btn.ok{{background:rgba(127,224,160,.15);color:var(--green)}}
  .btn.no{{background:rgba(255,90,90,.12);color:var(--red)}}
</style></head><body>
<header><h1>🎣 Træna Arctic Fishing</h1><span class="badge">Admin</span>
  <span class="muted" style="margin-left:auto">{len(bookings)} bookinger</span></header>
<div class="wrap">
  <h2>Kalender — neste 12 uker</h2>
  <div class="legend">
    <span><i class="sw p"></i> Forespørsel (pending)</span>
    <span><i class="sw c"></i> Bekreftet</span>
  </div>
  <div class="cal-scroll"><table class="cal">
    <thead><tr><th class="ulabel">Enhet</th>{month_hdr}</tr></thead>
    <tbody>{rows}</tbody>
  </table></div>

  <h2>Bookinger</h2>
  <table class="list">
    <thead><tr><th>Enhet</th><th>Periode</th><th>Gjest</th><th>Ant.</th>
      <th>Status</th><th>Handlinger</th></tr></thead>
    <tbody>{items}</tbody>
  </table>
</div></body></html>"""


if __name__ == "__main__":
    init_db()
    print(f"Træna booking-backend → http://localhost:{PORT}  (admin: /admin, {ADMIN_USER}/{ADMIN_PASS})")
    ThreadingHTTPServer(("0.0.0.0", PORT), H).serve_forever()
