"""Generate square, game-icon-style covers for works -> public/assets/works/icons/<slug>.png

Each icon: rounded square with a radial gradient, sunburst rays, a bold outlined cartoon
motif, a glossy top highlight and sparkles. SVGs are laid out on one HTML sheet, rendered
with headless Chrome, then cropped with Pillow (no image-generation service needed).

Usage: python3 scripts/generate_work_icons.py   (needs google-chrome + Pillow)
"""
import os
import subprocess
import sys
import tempfile

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "assets", "works", "icons")
SIZE = 256
COLS = 6
INK = "#1d1b2e"

# --- motifs: drawn in a 256x256 box, centered roughly at (128,140) -------------------
def o(extra=""):
    return f'stroke="{INK}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" {extra}'

M = {}
M["fish"] = lambda a, b: f'''
<path d="M52 140 Q110 70 180 132 L222 100 L214 140 L222 180 L180 148 Q110 210 52 140Z" fill="{a}" {o()}/>
<path d="M120 104 Q132 140 120 176" fill="none" {o()}/>
<circle cx="84" cy="130" r="11" fill="#fff" {o('stroke-width="5"')}/><circle cx="86" cy="131" r="5" fill="{INK}"/>
<path d="M150 118 l10 8 M150 150 l10 -8" {o('stroke-width="5"')}/>'''
M["robot"] = lambda a, b: f'''
<line x1="128" y1="44" x2="128" y2="70" {o()}/><circle cx="128" cy="40" r="10" fill="{b}" {o('stroke-width="5"')}/>
<rect x="60" y="70" width="136" height="112" rx="30" fill="{a}" {o()}/>
<rect x="78" y="94" width="100" height="52" rx="22" fill="#e9fbff" {o('stroke-width="5"')}/>
<circle cx="106" cy="120" r="10" fill="{INK}"/><circle cx="150" cy="120" r="10" fill="{INK}"/>
<path d="M108 162 Q128 174 148 162" fill="none" {o('stroke-width="6"')}/>
<rect x="40" y="108" width="20" height="40" rx="8" fill="{b}" {o('stroke-width="5"')}/><rect x="196" y="108" width="20" height="40" rx="8" fill="{b}" {o('stroke-width="5"')}/>
<rect x="84" y="182" width="88" height="30" rx="10" fill="{b}" {o()}/>'''
M["scroll"] = lambda a, b: f'''
<rect x="70" y="60" width="116" height="140" rx="10" fill="#fff6dc" {o()}/>
<rect x="56" y="48" width="144" height="26" rx="13" fill="{a}" {o()}/><rect x="56" y="188" width="144" height="26" rx="13" fill="{a}" {o()}/>
<path d="M90 100h76 M90 124h60 M90 148h70" {o('stroke-width="6"')}/>
<path d="M150 150 l30 -30 l10 10 l-30 30 l-14 4z" fill="{b}" {o('stroke-width="5"')}/>'''
M["crystal"] = lambda a, b: f'''
<path d="M84 196 h88 l-10 -22 h-68z" fill="{b}" {o()}/>
<circle cx="128" cy="118" r="64" fill="{a}" {o()}/>
<path d="M104 92 Q116 80 132 82" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>
<path d="M128 100 l8 16 l18 2 l-13 12 l4 18 l-17 -9 l-17 9 l4 -18 l-13 -12 l18 -2z" fill="#fff59d" {o('stroke-width="4"')}/>'''
M["brush"] = lambda a, b: f'''
<path d="M70 196 Q60 150 104 144 L128 168 Q122 206 70 196Z" fill="{b}" {o()}/>
<path d="M112 152 L188 64 Q200 54 208 64 Q214 74 202 84 L124 166Z" fill="{a}" {o()}/>
<path d="M96 160 Q90 176 80 184" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/>'''
M["rocket"] = lambda a, b: f'''
<path d="M128 40 Q176 80 168 160 H88 Q80 80 128 40Z" fill="{a}" {o()}/>
<circle cx="128" cy="104" r="20" fill="#cdeeff" {o('stroke-width="6"')}/>
<path d="M88 130 L60 176 L92 166Z M168 130 L196 176 L164 166Z" fill="{b}" {o()}/>
<path d="M106 166 Q128 230 150 166Z" fill="#ffb02e" {o()}/><path d="M118 168 Q128 200 138 168Z" fill="#fff36b"/>'''
M["book"] = lambda a, b: f'''
<path d="M40 76 Q84 60 128 80 V200 Q84 180 40 196Z" fill="{a}" {o()}/>
<path d="M216 76 Q172 60 128 80 V200 Q172 180 216 196Z" fill="{b}" {o()}/>
<path d="M60 104 Q84 96 108 106 M60 132 Q84 124 108 134 M148 106 Q172 96 196 104 M148 134 Q172 124 196 132" fill="none" {o('stroke-width="5"')} opacity=".8"/>'''
M["gear"] = lambda a, b: "".join(
    f'<rect x="116" y="38" width="24" height="40" rx="6" fill="{a}" {o("stroke-width=\'6\'")} transform="rotate({d} 128 130)"/>' for d in range(0, 360, 45)
) + f'''<circle cx="128" cy="130" r="62" fill="{a}" {o()}/><circle cx="128" cy="130" r="26" fill="{b}" {o()}/>'''
M["flowerpot"] = lambda a, b: f'''
<path d="M128 120 V74" {o()}/><path d="M128 100 Q100 80 92 98 Q110 112 128 100Z M128 92 Q156 70 164 90 Q146 104 128 92Z" fill="#5fd068" {o('stroke-width="5"')}/>
<g transform="translate(128 60)">{''.join(f'<ellipse rx="12" ry="20" cy="-16" fill="{b}" {o("stroke-width=\'5\'")} transform="rotate({d})"/>' for d in range(0,360,60))}<circle r="12" fill="#ffe14d" {o('stroke-width="5"')}/></g>
<path d="M70 122 H186 L170 204 H86Z" fill="{a}" {o()}/><rect x="62" y="114" width="132" height="24" rx="8" fill="{a}" {o()}/>'''
M["tomato"] = lambda a, b: f'''
<circle cx="128" cy="140" r="72" fill="{a}" {o()}/>
<path d="M128 74 l-26 -10 l14 18 l-24 6 l26 6 l10 20 l10 -20 l26 -6 l-24 -6 l14 -18z" fill="#4cc35a" {o('stroke-width="5"')}/>
<circle cx="128" cy="146" r="36" fill="#fff" {o('stroke-width="5"')}/><path d="M128 146 V122 M128 146 l18 10" {o('stroke-width="6"')}/>'''
M["chip"] = lambda a, b: "".join(
    f'<path d="M{x} 52 v24 M{x} 180 v24 M52 {x} h24 M180 {x} h24" {o("stroke-width=\'7\'")}/>' for x in (96, 128, 160)
) + f'''<rect x="72" y="72" width="112" height="112" rx="14" fill="{a}" {o()}/><rect x="98" y="98" width="60" height="60" rx="8" fill="{b}" {o('stroke-width="5"')}/>'''
M["bolt"] = lambda a, b: f'''<path d="M146 36 L74 144 H122 L104 220 L184 108 H136Z" fill="{a}" {o()}/><path d="M140 60 L100 128" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".7"/>'''
M["gem"] = lambda a, b: f'''
<path d="M80 72 H176 L212 112 L128 210 L44 112Z" fill="{a}" {o()}/>
<path d="M44 112 H212 M80 72 L104 112 L128 210 L152 112 L176 72 M104 112 L128 72 L152 112" fill="none" {o('stroke-width="5"')}/>
<path d="M66 106 L84 82" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".8"/>'''
M["ball"] = lambda a, b: f'''
<circle cx="128" cy="134" r="70" fill="{a}" {o()}/><path d="M60 120 Q128 160 196 120" fill="none" {o()}/>
<circle cx="128" cy="138" r="18" fill="#fff" {o('stroke-width="6"')}/><path d="M60 140 H110 M146 140 H196" {o('stroke-width="6"')}/>
<path d="M92 92 Q104 80 120 78" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".7" fill="none"/>'''
M["cat"] = lambda a, b: f'''
<path d="M60 92 L72 40 L110 72 Q128 66 146 72 L184 40 L196 92 Q212 140 180 180 Q128 214 76 180 Q44 140 60 92Z" fill="{a}" {o()}/>
<ellipse cx="102" cy="122" rx="10" ry="14" fill="{INK}"/><ellipse cx="154" cy="122" rx="10" ry="14" fill="{INK}"/>
<path d="M120 146 h16 l-8 10z" fill="{b}" {o('stroke-width="4"')}/><path d="M108 164 Q128 178 148 164" fill="none" {o('stroke-width="5"')}/>
<path d="M40 140 h40 M44 160 l38 -8 M216 140 h-40 M212 160 l-38 -8" {o('stroke-width="4"')}/>'''
M["planet"] = lambda a, b: f'''
<circle cx="128" cy="130" r="58" fill="{a}" {o()}/>
<ellipse cx="128" cy="134" rx="104" ry="28" fill="none" stroke="{b}" stroke-width="16" transform="rotate(-18 128 134)"/>
<ellipse cx="128" cy="134" rx="104" ry="28" fill="none" stroke="{INK}" stroke-width="5" transform="rotate(-18 128 134)"/>
<circle cx="108" cy="110" r="10" fill="#fff" opacity=".5"/><circle cx="150" cy="150" r="8" fill="{INK}" opacity=".25"/>'''
M["ghost"] = lambda a, b: f'''
<path d="M64 200 V116 Q64 56 128 56 Q192 56 192 116 V200 L170 184 L150 200 L128 184 L106 200 L86 184Z" fill="{a}" {o()}/>
<ellipse cx="106" cy="118" rx="12" ry="16" fill="{INK}"/><ellipse cx="150" cy="118" rx="12" ry="16" fill="{INK}"/>
<ellipse cx="128" cy="154" rx="12" ry="9" fill="{b}" {o('stroke-width="4"')}/>'''
M["note"] = lambda a, b: f'''
<path d="M100 72 L188 52 V160" fill="none" {o('stroke-width="12"')}/><path d="M100 72 V180" {o('stroke-width="12"')}/>
<ellipse cx="80" cy="182" rx="28" ry="22" fill="{a}" {o()}/><ellipse cx="168" cy="162" rx="28" ry="22" fill="{b}" {o()}/>'''
M["keyboard"] = lambda a, b: f'''<rect x="36" y="86" width="184" height="100" rx="16" fill="{a}" {o()}/>''' + "".join(
    f'<rect x="{52+i*30}" y="{102+r*28}" width="22" height="20" rx="5" fill="{"#fff" if (i+r)%3 else b}" {o("stroke-width=\'4\'")}/>' for r in range(2) for i in range(6)
) + f'<rect x="82" y="158" width="92" height="18" rx="5" fill="#fff" {o("stroke-width=\'4\'")}/>'
M["melon"] = lambda a, b: f'''
<path d="M40 100 A88 88 0 0 0 216 100Z" fill="#4cc35a" {o()}/><path d="M56 104 A72 72 0 0 0 200 104Z" fill="{a}" {o('stroke-width="5"')}/>
''' + "".join(f'<ellipse cx="{x}" cy="{y}" rx="5" ry="8" fill="{INK}"/>' for x, y in [(96, 124), (128, 140), (160, 124), (112, 158), (146, 158)])
M["star"] = lambda a, b: f'''<path d="M128 36 L154 100 L222 104 L170 148 L186 214 L128 178 L70 214 L86 148 L34 104 L102 100Z" fill="{a}" {o()}/>
<circle cx="110" cy="132" r="8" fill="{INK}"/><circle cx="146" cy="132" r="8" fill="{INK}"/><path d="M114 156 Q128 166 142 156" fill="none" {o('stroke-width="5"')}/>'''
M["coin"] = lambda a, b: f'''<ellipse cx="128" cy="170" rx="70" ry="22" fill="{b}" {o()}/><rect x="58" y="150" width="140" height="20" fill="{b}"/>
<circle cx="128" cy="116" r="66" fill="{a}" {o()}/><circle cx="128" cy="116" r="46" fill="none" {o('stroke-width="5"')}/>
<path d="M112 96 L128 116 L144 96 M128 116 V146 M110 122 H146 M110 136 H146" fill="none" {o('stroke-width="7"')}/>'''
M["crown"] = lambda a, b: f'''<path d="M44 92 L88 132 L128 64 L168 132 L212 92 L196 190 H60Z" fill="{a}" {o()}/>
<circle cx="128" cy="152" r="14" fill="{b}" {o('stroke-width="5"')}/><circle cx="84" cy="160" r="9" fill="#fff" {o('stroke-width="4"')}/><circle cx="172" cy="160" r="9" fill="#fff" {o('stroke-width="4"')}/>'''
M["pot"] = lambda a, b: f'''<path d="M100 66 Q106 48 112 66 M128 58 Q134 40 140 58 M156 66 Q162 48 168 66" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
<path d="M52 108 H204 V168 Q204 204 128 204 Q52 204 52 168Z" fill="{a}" {o()}/><rect x="40" y="96" width="176" height="22" rx="11" fill="{b}" {o()}/>
<path d="M34 136 H52 M204 136 H222" {o('stroke-width="10"')}/>'''
M["sun"] = lambda a, b: "".join(f'<path d="M150 90 L150 52" {o("stroke-width=\'8\'")} transform="rotate({d} 150 96)"/>' for d in range(0, 360, 45)) + f'''
<circle cx="150" cy="96" r="30" fill="{b}" {o()}/>
<path d="M58 196 Q30 196 34 168 Q34 140 66 142 Q76 112 110 120 Q136 112 148 140 Q186 140 186 170 Q186 196 160 196Z" fill="{a}" {o()}/>'''
M["palette"] = lambda a, b: f'''<path d="M128 48 Q210 48 214 124 Q216 160 180 156 Q156 154 160 178 Q164 208 128 208 Q44 206 42 128 Q44 48 128 48Z" fill="{a}" {o()}/>
<circle cx="92" cy="104" r="14" fill="#ff5252" {o('stroke-width="4"')}/><circle cx="132" cy="84" r="14" fill="#ffd740" {o('stroke-width="4"')}/>
<circle cx="172" cy="108" r="14" fill="#40c4ff" {o('stroke-width="4"')}/><circle cx="86" cy="150" r="14" fill="{b}" {o('stroke-width="4"')}/>'''
M["cards"] = lambda a, b: f'''<rect x="54" y="66" width="96" height="132" rx="14" fill="{b}" {o()} transform="rotate(-12 102 132)"/>
<rect x="104" y="58" width="96" height="132" rx="14" fill="{a}" {o()} transform="rotate(10 152 124)"/>
<text x="152" y="140" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="52" fill="#fff" stroke="{INK}" stroke-width="3" transform="rotate(10 152 124)">A</text>'''
M["snake"] = lambda a, b: f'''<path d="M56 196 Q56 150 100 150 H156 Q196 150 196 112 Q196 72 156 72 H120" fill="none" stroke="{INK}" stroke-width="40" stroke-linecap="round"/>
<path d="M56 196 Q56 150 100 150 H156 Q196 150 196 112 Q196 72 156 72 H120" fill="none" stroke="{a}" stroke-width="28" stroke-linecap="round"/>
<circle cx="108" cy="72" r="26" fill="{a}" {o()}/><circle cx="100" cy="64" r="6" fill="{INK}"/><path d="M82 76 h-14 l-6 -6 M68 76 l-6 6" {o('stroke-width="4"')}/>
<circle cx="200" cy="200" r="14" fill="{b}" {o('stroke-width="5"')}/>'''
M["tower"] = lambda a, b: f'''<path d="M76 210 L88 96 H168 L180 210Z" fill="{a}" {o()}/>
<path d="M80 96 V66 H100 V80 H118 V66 H138 V80 H156 V66 H176 V96Z" fill="{a}" {o()}/>
<path d="M116 210 V170 Q128 152 140 170 V210Z" fill="{INK}"/><rect x="118" y="112" width="20" height="26" rx="8" fill="#ffe14d" {o('stroke-width="4"')}/>
<path d="M128 66 V34 L156 44 L128 54" fill="{b}" {o('stroke-width="5"')}/>'''
M["potion"] = lambda a, b: f'''<rect x="108" y="40" width="40" height="26" rx="6" fill="#c08a52" {o()}/>
<path d="M112 66 V98 Q60 118 64 164 Q70 210 128 210 Q186 210 192 164 Q196 118 144 98 V66Z" fill="#e8f6ff" {o()}/>
<path d="M72 150 Q128 130 184 150 Q184 204 128 204 Q72 204 72 150Z" fill="{a}"/>
<circle cx="110" cy="170" r="8" fill="#fff" opacity=".8"/><circle cx="148" cy="160" r="5" fill="#fff" opacity=".8"/><circle cx="132" cy="184" r="6" fill="{b}"/>'''
M["plane"] = lambda a, b: f'''<path d="M36 128 L216 52 L156 208 L124 150Z" fill="{a}" {o()}/><path d="M124 150 L216 52 L104 168 L112 200Z" fill="{b}" {o()}/>'''
M["shoe"] = lambda a, b: f'''<path d="M48 176 Q44 120 76 112 L104 84 Q128 112 156 128 Q212 132 214 176Z" fill="{a}" {o()}/>
<rect x="40" y="172" width="180" height="22" rx="10" fill="#fff" {o()}/><path d="M104 112 l14 10 M116 100 l14 10" {o('stroke-width="5"')}/>
<path d="M20 120 h30 M14 146 h28" stroke="#fff" stroke-width="7" stroke-linecap="round"/>'''

# name: (background, accent, light, deep, pop). "pop" fills the motif so it contrasts the background.
PALETTES = {
    "red": ("#ff6b6b", "#4dabf7", "#ffe3e3", "#c92a2a", "#ffe066"),
    "orange": ("#ff922b", "#ff6b6b", "#ffe8cc", "#d9480f", "#74c0fc"),
    "yellow": ("#fcc419", "#ff6b6b", "#fff9db", "#e67700", "#ff8787"),
    "green": ("#51cf66", "#ff6b6b", "#ebfbee", "#2b8a3e", "#ffe066"),
    "teal": ("#20c997", "#ffe066", "#e6fcf5", "#087f5b", "#ffa94d"),
    "blue": ("#4dabf7", "#ff6b6b", "#e7f5ff", "#1864ab", "#ffe066"),
    "indigo": ("#748ffc", "#ffa94d", "#edf2ff", "#364fc7", "#63e6be"),
    "purple": ("#9775fa", "#ff8787", "#f3f0ff", "#5f3dc4", "#ffd43b"),
    "pink": ("#f783ac", "#ffe066", "#fff0f6", "#a61e4d", "#74c0fc"),
    "dark": ("#495057", "#ffa94d", "#adb5bd", "#212529", "#63e6be"),
}

# slug -> (motif, palette). Keep in sync with seed_demo_works.py demo slugs.
# Only the real, live works (see backend seed_official_works). Add a line per new real work.
ICONS = {
    "404notfound": ("fish", "blue"),
    "agent-prompt-template": ("scroll", "orange"),
    "codex-goal-launcher": ("rocket", "indigo"),
    "codex-tutorial": ("book", "green"),
    "openclaw-easy-config": ("gear", "dark"),
    "print-garden": ("flowerpot", "pink"),
    "prompt-library": ("cards", "yellow"),
}


def icon_svg(slug, motif, palette):
    main, accent, light, deep, pop = PALETTES[palette]
    rays = "".join(
        f'<path d="M128 140 L{128 + 260 * __import__("math").cos(i * 0.5236):.0f} {140 + 260 * __import__("math").sin(i * 0.5236):.0f} L{128 + 260 * __import__("math").cos(i * 0.5236 + 0.26):.0f} {140 + 260 * __import__("math").sin(i * 0.5236 + 0.26):.0f}Z" fill="#fff" opacity=".13"/>'
        for i in range(12)
    )
    sparkle = lambda x, y, s: f'<path d="M{x} {y-s} Q{x} {y} {x+s} {y} Q{x} {y} {x} {y+s} Q{x} {y} {x-s} {y} Q{x} {y} {x} {y-s}Z" fill="#fff"/>'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" viewBox="0 0 256 256">
<defs>
<radialGradient id="bg-{slug}" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="{light}"/><stop offset=".55" stop-color="{main}"/><stop offset="1" stop-color="{deep}"/></radialGradient>
<linearGradient id="gl-{slug}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="c-{slug}"><rect x="6" y="6" width="244" height="244" rx="52"/></clipPath>
</defs>
<g clip-path="url(#c-{slug})">
<rect width="256" height="256" fill="url(#bg-{slug})"/>{rays}
<ellipse cx="128" cy="226" rx="88" ry="16" fill="{INK}" opacity=".22"/>
<g>{M[motif](pop, accent)}</g>
<path d="M6 6 H250 V96 Q128 128 6 96Z" fill="url(#gl-{slug})" opacity=".55"/>
{sparkle(48, 52, 12)}{sparkle(212, 70, 8)}{sparkle(206, 206, 6)}
</g>
<rect x="6" y="6" width="244" height="244" rx="52" fill="none" stroke="{INK}" stroke-width="8"/>
<rect x="16" y="16" width="224" height="224" rx="44" fill="none" stroke="#fff" stroke-width="3" opacity=".55"/>
</svg>'''


def main():
    os.makedirs(OUT, exist_ok=True)
    slugs = list(ICONS)
    rows = (len(slugs) + COLS - 1) // COLS
    cells = "".join(f'<div class="c">{icon_svg(s, *ICONS[s])}</div>' for s in slugs)
    html = f'''<!doctype html><html><head><style>html,body{{margin:0;background:transparent}}
.g{{display:grid;grid-template-columns:repeat({COLS},{SIZE}px);grid-auto-rows:{SIZE}px}}.c svg{{display:block}}</style></head>
<body><div class="g">{cells}</div></body></html>'''
    with tempfile.TemporaryDirectory() as tmp:
        page, shot = os.path.join(tmp, "sheet.html"), os.path.join(tmp, "sheet.png")
        open(page, "w", encoding="utf-8").write(html)
        subprocess.run(
            ["google-chrome", "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
             "--default-background-color=00000000", "--force-device-scale-factor=1",
             f"--window-size={COLS * SIZE},{rows * SIZE}", f"--screenshot={shot}", f"file://{page}"],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=120,
        )
        sheet = Image.open(shot).convert("RGBA")
        for index, slug in enumerate(slugs):
            x, y = (index % COLS) * SIZE, (index // COLS) * SIZE
            sheet.crop((x, y, x + SIZE, y + SIZE)).save(os.path.join(OUT, f"{slug}.png"), optimize=True)
    print(f"Wrote {len(slugs)} icons to {OUT}")


if __name__ == "__main__":
    sys.exit(main())
