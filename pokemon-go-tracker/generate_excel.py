#!/usr/bin/env python3
"""Genera il file Excel Pokemon GO Tracker con formule automatiche."""

from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

OUTPUT = Path(__file__).parent / "PokemonGO_Tracker.xlsx"

# XP cumulativo per raggiungere ogni livello (1-50)
XP_TABLE = [
    0, 2500, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 35000,
    50000, 75000, 100000, 150000, 200000, 250000, 300000, 350000, 400000, 500000,
    600000, 700000, 800000, 900000, 1000000, 1250000, 1500000, 1750000, 2000000, 2500000,
    3000000, 3500000, 4000000, 4500000, 5000000, 6000000, 7000000, 8000000, 9000000, 10000000,
    12000000, 14000000, 16000000, 18000000, 20000000, 22500000, 25000000, 27500000, 30000000, 30000000,
]

GENERATIONS = [
    ("Gen 1 - Kanto", 151),
    ("Gen 2 - Johto", 100),
    ("Gen 3 - Hoenn", 135),
    ("Gen 4 - Sinnoh", 107),
    ("Gen 5 - Unova", 156),
    ("Gen 6 - Kalos", 72),
    ("Gen 7 - Alola", 88),
    ("Gen 8 - Galar", 96),
    ("Gen 9 - Paldea", 120),
]

HEADER_FILL = PatternFill("solid", fgColor="1E3A5F")
HEADER_FONT = Font(bold=True, color="FFFFFF", size=11)
ACCENT_FILL = PatternFill("solid", fgColor="E8F4FD")
INPUT_FILL = PatternFill("solid", fgColor="FFF9E6")
CALC_FILL = PatternFill("solid", fgColor="E8F5E9")
THIN = Side(style="thin", color="CCCCCC")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)


def style_header_row(ws, row: int, cols: int) -> None:
    for col in range(1, cols + 1):
        cell = ws.cell(row=row, column=col)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = BORDER


def style_range(ws, min_row: int, max_row: int, min_col: int, max_col: int, fill=None) -> None:
    for r in range(min_row, max_row + 1):
        for c in range(min_col, max_col + 1):
            cell = ws.cell(row=r, column=c)
            cell.border = BORDER
            cell.alignment = Alignment(vertical="center")
            if fill:
                cell.fill = fill


def set_col_widths(ws, widths: dict[int, float]) -> None:
    for col, width in widths.items():
        ws.column_dimensions[get_column_letter(col)].width = width


def build_dashboard(wb: Workbook) -> None:
    ws = wb.active
    ws.title = "Dashboard"
    ws["A1"] = "POKEMON GO - TRACKER PROGRESSI"
    ws["A1"].font = Font(bold=True, size=16, color="1E3A5F")
    ws.merge_cells("A1:F1")

    ws["A3"] = "Risorsa"
    ws["B3"] = "Valore attuale"
    ws["C3"] = "Obiettivo"
    ws["D3"] = "Progresso %"
    style_header_row(ws, 3, 4)

    resources = [
        ("Stardust", "B4", "C4", "D4"),
        ("Poke Ball / Great / Ultra", "B5", "C5", "D5"),
        ("Caramelle rare", "B6", "C6", "D6"),
        ("Monete amicizia", "B7", "C7", "D7"),
        ("Incubatrici", "B8", "C8", "D8"),
        ("Pass Raid", "B9", "C9", "D9"),
    ]

    row = 4
    for name, val_cell, goal_cell, pct_cell in resources:
        ws.cell(row=row, column=1, value=name)
        ws[val_cell].fill = INPUT_FILL
        ws[goal_cell].fill = INPUT_FILL
        val_ref = val_cell
        goal_ref = goal_cell
        ws[pct_cell] = f'=IF({goal_ref}=0,"",MIN({val_ref}/{goal_ref},1))'
        ws[pct_cell].number_format = "0.0%"
        ws[pct_cell].fill = CALC_FILL
        row += 1

    style_range(ws, 4, 9, 1, 4, None)
    for r in range(4, 10):
        ws.cell(row=r, column=1).fill = ACCENT_FILL

    ws["A11"] = "RIEPILOGO POKEDEX"
    ws["A11"].font = Font(bold=True, size=12)
    ws["A12"] = "Totale catturati"
    ws["B12"] = "=SUM(Pokedex!C4:C12)"
    ws["A13"] = "Totale disponibili"
    ws["B13"] = "=SUM(Pokedex!B4:B12)"
    ws["A14"] = "Completamento globale"
    ws["B14"] = "=IF(B13=0,\"\",B12/B13)"
    ws["B14"].number_format = "0.00%"
    ws["B12"].fill = CALC_FILL
    ws["B13"].fill = CALC_FILL
    ws["B14"].fill = CALC_FILL

    ws["A16"] = "RIEPILOGO SHINY"
    ws["A16"].font = Font(bold=True, size=12)
    ws["A17"] = "Shiny totali registrati"
    ws["B17"] = "=COUNTA(Shiny!B4:B500)"
    ws["A18"] = "Shiny unici (specie diverse)"
    ws["B18"] = '=COUNTA(UNIQUE(FILTER(Shiny!B4:B500,Shiny!B4:B500<>"")))'
    ws["B17"].fill = CALC_FILL
    ws["B18"].fill = CALC_FILL

    ws["A20"] = "LIVELLO & XP"
    ws["A20"].font = Font(bold=True, size=12)
    ws["A21"] = "XP totale (inserisci qui)"
    ws["B21"].fill = INPUT_FILL
    ws["A22"] = "Livello calcolato"
    ws["B22"] = "=IF(B21=\"\",\"\",_xlfn.XLOOKUP(B21,XP!B2:B51,XP!A2:A51,\"\",1,-1))"
    ws["A23"] = "XP verso prossimo livello"
    ws["B23"] = '=IF(B21="","",IF(B22>=50,0,INDEX(XP!B2:B51,MATCH(B22,XP!A2:A51,0)+1)-B21))'
    ws["A24"] = "% progresso livello attuale"
    ws["B24"] = '=IF(OR(B21="",B22>=50),"",IF(B22=1,B21/INDEX(XP!B2:B51,2),(B21-INDEX(XP!B2:B51,MATCH(B22,XP!A2:A51,0)))/(INDEX(XP!B2:B51,MATCH(B22,XP!A2:A51,0)+1)-INDEX(XP!B2:B51,MATCH(B22,XP!A2:A51,0)))))'
    ws["B22"].fill = CALC_FILL
    ws["B23"].fill = CALC_FILL
    ws["B24"].number_format = "0.0%"
    ws["B24"].fill = CALC_FILL

    ws["A26"] = "RAID & GO BATTLE LEAGUE"
    ws["A26"].font = Font(bold=True, size=12)
    ws["A27"] = "Raid vinti"
    ws["B27"] = "=Battaglie!B4"
    ws["A28"] = "Raid persi"
    ws["B28"] = "=Battaglie!B5"
    ws["A29"] = "Win rate raid"
    ws["B29"] = "=Battaglie!D4"
    ws["A30"] = "Vittorie GBL"
    ws["B30"] = "=Battaglie!B8"
    ws["A31"] = "Sconfitte GBL"
    ws["B31"] = "=Battaglie!B9"
    ws["A32"] = "Win rate GBL"
    ws["B32"] = "=Battaglie!D8"
    for r in range(27, 33):
        ws.cell(row=r, column=2).fill = CALC_FILL
    ws["B29"].number_format = "0.0%"
    ws["B32"].number_format = "0.0%"

    set_col_widths(ws, {1: 28, 2: 18, 3: 16, 4: 14})


def build_pokedex(wb: Workbook) -> None:
    ws = wb.create_sheet("Pokedex")
    headers = ["Generazione", "Totale specie", "Catturati (inserisci)", "Visti (inserisci)", "Mancanti", "% Catturati", "% Visti"]
    for i, h in enumerate(headers, 1):
        ws.cell(row=3, column=i, value=h)
    style_header_row(ws, 3, 7)

    start = 4
    for idx, (name, total) in enumerate(GENERATIONS):
        row = start + idx
        ws.cell(row=row, column=1, value=name)
        ws.cell(row=row, column=2, value=total)
        ws.cell(row=row, column=3).fill = INPUT_FILL
        ws.cell(row=row, column=4).fill = INPUT_FILL
        ws.cell(row=row, column=5, value=f"=B{row}-C{row}")
        ws.cell(row=row, column=6, value=f"=IF(B{row}=0,\"\",C{row}/B{row})")
        ws.cell(row=row, column=7, value=f"=IF(B{row}=0,\"\",D{row}/B{row})")
        ws.cell(row=row, column=5).fill = CALC_FILL
        ws.cell(row=row, column=6).fill = CALC_FILL
        ws.cell(row=row, column=7).fill = CALC_FILL
        ws.cell(row=row, column=6).number_format = "0.0%"
        ws.cell(row=row, column=7).number_format = "0.0%"

    total_row = start + len(GENERATIONS)
    ws.cell(row=total_row, column=1, value="TOTALE")
    ws.cell(row=total_row, column=1).font = Font(bold=True)
    ws.cell(row=total_row, column=2, value=f"=SUM(B{start}:B{total_row - 1})")
    ws.cell(row=total_row, column=3, value=f"=SUM(C{start}:C{total_row - 1})")
    ws.cell(row=total_row, column=4, value=f"=SUM(D{start}:D{total_row - 1})")
    ws.cell(row=total_row, column=5, value=f"=B{total_row}-C{total_row}")
    ws.cell(row=total_row, column=6, value=f"=IF(B{total_row}=0,\"\",C{total_row}/B{total_row})")
    ws.cell(row=total_row, column=7, value=f"=IF(B{total_row}=0,\"\",D{total_row}/B{total_row})")
    for c in range(2, 8):
        ws.cell(row=total_row, column=c).font = Font(bold=True)
        ws.cell(row=total_row, column=c).fill = CALC_FILL
    ws.cell(row=total_row, column=6).number_format = "0.0%"
    ws.cell(row=total_row, column=7).number_format = "0.0%"

    ws["A1"] = "Inserisci manualmente i conteggi catturati/visti per ogni generazione."
    ws.merge_cells("A1:G1")
    set_col_widths(ws, {1: 22, 2: 14, 3: 18, 4: 18, 5: 12, 6: 14, 7: 12})


def build_shiny(wb: Workbook) -> None:
    ws = wb.create_sheet("Shiny")
    headers = ["Data", "Pokemon", "CP", "IV Att", "IV Dif", "IV PS", "IV %", "Metodo", "Note"]
    for i, h in enumerate(headers, 1):
        ws.cell(row=3, column=i, value=h)
    style_header_row(ws, 3, 9)

    for row in range(4, 54):
        for col in range(1, 7):
            ws.cell(row=row, column=col).fill = INPUT_FILL
        ws.cell(row=row, column=7, value=f'=IF(OR(D{row}="",E{row}="",F{row}=""),"",(D{row}+E{row}+F{row})/45)')
        ws.cell(row=row, column=7).number_format = "0.0%"
        ws.cell(row=row, column=7).fill = CALC_FILL
        ws.cell(row=row, column=8).fill = INPUT_FILL
        ws.cell(row=row, column=9).fill = INPUT_FILL

    ws["A1"] = "Registro shiny: compila una riga per ogni shiny catturato. IV% calcolato automaticamente."
    ws.merge_cells("A1:I1")
    ws["K3"] = "Statistiche"
    ws["K3"].font = Font(bold=True)
    ws["K4"] = "Totale shiny"
    ws["L4"] = "=COUNTA(B4:B500)"
    ws["K5"] = "IV medio %"
    ws["L5"] = '=IFERROR(AVERAGE(G4:G500),"")'
    ws["L5"].number_format = "0.0%"
    ws["K6"] = "Shiny perfetti (100%)"
    ws["L6"] = '=COUNTIF(G4:G500,1)'
    for r in range(4, 7):
        ws.cell(row=r, column=12).fill = CALC_FILL
    set_col_widths(ws, {1: 12, 2: 18, 3: 8, 4: 8, 5: 8, 6: 8, 7: 8, 8: 14, 9: 24, 11: 16, 12: 12})


def build_xp(wb: Workbook) -> None:
    ws = wb.create_sheet("XP")
    ws["A1"] = "Livello"
    ws["B1"] = "XP cumulativo richiesto"
    ws["C1"] = "XP per questo livello"
    style_header_row(ws, 1, 3)
    for i, xp in enumerate(XP_TABLE, start=2):
        level = i - 1
        ws.cell(row=i, column=1, value=level)
        ws.cell(row=i, column=2, value=xp)
        if level == 1:
            ws.cell(row=i, column=3, value=xp)
        else:
            ws.cell(row=i, column=3, value=f"=B{i}-B{i-1}")
    style_range(ws, 2, 51, 1, 3, ACCENT_FILL)
    set_col_widths(ws, {1: 10, 2: 22, 3: 20})


def build_medals(wb: Workbook) -> None:
    ws = wb.create_sheet("Medaglie")
    headers = ["Medaglia", "Progresso (inserisci)", "Bronzo", "Argento", "Oro", "Platino", "Tier attuale", "% verso prossimo"]
    for i, h in enumerate(headers, 1):
        ws.cell(row=3, column=i, value=h)
    style_header_row(ws, 3, 8)

    default_medals = [
        "Collezionista", "Breeder", "Scienziato", "Giovane", "Pescatore",
        "Giornalista", "Gentiluomo", "Pilot", "Camper", "Backpacker",
        "Psicologo", "Skier", "Delinquent", "Gardener", "Idol",
        "Great League Veteran", "Ultra League Veteran", "Master League Veteran",
        "Battle Girl", "Black Belt", "Bird Keeper", "Bug Catcher",
        "Hex Maniac", "Hiker", "Kindler", "Punk Girl", "Schoolkid",
        "Ruin Maniac", "Rocker", "Swimmer", "Fairy Tale Girl",
    ]

    for idx, medal in enumerate(default_medals):
        row = 4 + idx
        ws.cell(row=row, column=1, value=medal)
        ws.cell(row=row, column=2).fill = INPUT_FILL
        for col in range(3, 6):
            ws.cell(row=row, column=col).fill = INPUT_FILL
        ws.cell(row=row, column=6).fill = INPUT_FILL
        # Tier: Platino >= C, Oro >= D, Argento >= E, Bronzo >= F
        ws.cell(row=row, column=7, value=(
            f'=IF(B{row}="","",IF(B{row}>=F{row},"Platino",IF(B{row}>=E{row},"Oro",IF(B{row}>=D{row},"Argento",IF(B{row}>=C{row},"Bronzo","Nessuno")))))'
        ))
        ws.cell(row=row, column=8, value=(
            f'=IF(B{row}="","",IF(B{row}>=F{row},1,IF(B{row}>=E{row},(B{row}-E{row})/(F{row}-E{row}),IF(B{row}>=D{row},(B{row}-D{row})/(E{row}-D{row}),IF(B{row}>=C{row},(B{row}-C{row})/(D{row}-C{row}),B{row}/C{row})))))'
        ))
        ws.cell(row=row, column=7).fill = CALC_FILL
        ws.cell(row=row, column=8).fill = CALC_FILL
        ws.cell(row=row, column=8).number_format = "0.0%"

    ws["A1"] = "Inserisci progresso e soglie tier (Bronzo/Argento/Oro/Platino) per ogni medaglia."
    ws.merge_cells("A1:H1")
    set_col_widths(ws, {1: 24, 2: 16, 3: 10, 4: 10, 5: 10, 6: 10, 7: 14, 8: 16})


def build_battles(wb: Workbook) -> None:
    ws = wb.create_sheet("Battaglie")
    ws["A1"] = "Statistiche Raid e Go Battle League"
    ws["A1"].font = Font(bold=True, size=12)

    ws["A3"] = "RAID"
    ws["A3"].font = Font(bold=True)
    ws["A4"] = "Vittorie"
    ws["B4"].fill = INPUT_FILL
    ws["A5"] = "Sconfitte"
    ws["B5"].fill = INPUT_FILL
    ws["A6"] = "Totale"
    ws["B6"] = "=B4+B5"
    ws["A7"] = "Win rate"
    ws["C4"] = "Win rate"
    ws["D4"] = "=IF(B6=0,\"\",B4/B6)"
    ws["D4"].number_format = "0.0%"
    ws["B6"].fill = CALC_FILL
    ws["D4"].fill = CALC_FILL

    ws["A9"] = "GO BATTLE LEAGUE"
    ws["A9"].font = Font(bold=True)
    ws["A10"] = "Vittorie"
    ws["B10"].fill = INPUT_FILL
    ws["A11"] = "Sconfitte"
    ws["B11"].fill = INPUT_FILL
    ws["A12"] = "Totale"
    ws["B12"] = "=B10+B11"
    ws["C10"] = "Win rate"
    ws["D10"] = "=IF(B12=0,\"\",B10/B12)"
    ws["D10"].number_format = "0.0%"
    ws["D8"] = "Win rate"
    ws["D8"] = "=IF(B12=0,\"\",B10/B12)"
    ws["D8"].number_format = "0.0%"
    ws["B8"] = "=B10"
    ws["B9"] = "=B11"
    ws["B12"].fill = CALC_FILL
    ws["D8"].fill = CALC_FILL
    ws["D10"].fill = CALC_FILL

    ws["A14"] = "BUDDY"
    ws["A14"].font = Font(bold=True)
    ws["A15"] = "Nome buddy"
    ws["B15"].fill = INPUT_FILL
    ws["A16"] = "Km percorsi"
    ws["B16"].fill = INPUT_FILL
    ws["A17"] = "Caramelle guadagnate"
    ws["B17"].fill = INPUT_FILL
    ws["A18"] = "Cuori"
    ws["B18"].fill = INPUT_FILL
    ws["A19"] = "Caramelle per km"
    ws["B19"] = "=IF(B16=0,\"\",B17/B16)"
    ws["B19"].number_format = "0.00"
    ws["B19"].fill = CALC_FILL

    set_col_widths(ws, {1: 22, 2: 14, 3: 12, 4: 12})


def build_legendary(wb: Workbook) -> None:
    ws = wb.create_sheet("Leggendari")
    headers = ["Pokemon", "Catturato (S/N)", "Shiny (S/N)", "IV %", "Data ultima cattura", "Tentativi raid", "Catture", "Win rate"]
    for i, h in enumerate(headers, 1):
        ws.cell(row=3, column=i, value=h)
    style_header_row(ws, 3, 8)

    legendaries = [
        "Mewtwo", "Rayquaza", "Groudon", "Kyogre", "Dialga", "Palkia",
        "Giratina", "Reshiram", "Zekrom", "Kyurem", "Xerneas", "Yveltal",
        "Zygarde", "Solgaleo", "Lunala", "Necrozma", "Zacian", "Zamazenta",
        "Eternatus", "Calyrex", "Koraidon", "Miraidon",
    ]

    for idx, name in enumerate(legendaries):
        row = 4 + idx
        ws.cell(row=row, column=1, value=name)
        for col in range(2, 6):
            ws.cell(row=row, column=col).fill = INPUT_FILL
        ws.cell(row=row, column=6).fill = INPUT_FILL
        ws.cell(row=row, column=7).fill = INPUT_FILL
        ws.cell(row=row, column=8, value=f'=IF(OR(F{row}="",F{row}=0),"",G{row}/F{row})')
        ws.cell(row=row, column=8).number_format = "0.0%"
        ws.cell(row=row, column=8).fill = CALC_FILL

    ws["A1"] = "Traccia leggendari/mitici: inserisci S o N per catturato/shiny, tentativi e catture manualmente."
    ws.merge_cells("A1:H1")
    set_col_widths(ws, {1: 16, 2: 14, 3: 12, 4: 8, 5: 18, 6: 14, 7: 10, 8: 10})


def main() -> None:
    wb = Workbook()
    build_dashboard(wb)
    build_pokedex(wb)
    build_shiny(wb)
    build_xp(wb)
    build_medals(wb)
    build_battles(wb)
    build_legendary(wb)
    wb.save(OUTPUT)
    print(f"Creato: {OUTPUT}")


if __name__ == "__main__":
    main()
