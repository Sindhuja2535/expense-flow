import csv
from collections import defaultdict
from datetime import datetime
from pathlib import Path

base = Path(__file__).parent
inp = base / "expenses.csv"
out_dir = base / "output"
out_dir.mkdir(exist_ok=True)

rows = []
with inp.open() as f:
    r = csv.DictReader(f, delimiter='\t')
    for row in r:
        rows.append(row)

# monthly trends
monthly = defaultdict(lambda: {'total': 0.0, 'count': 0})
for row in rows:
    try:
        d = datetime.strptime(row['expense_date'], '%Y-%m-%d')
        key = d.strftime('%Y-%m')
        monthly[key]['total'] += float(row['amount'] or 0)
        monthly[key]['count'] += 1
    except Exception:
        continue

# write monthly
monthly_path = out_dir / 'monthly_trends.csv'
with monthly_path.open('w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['month', 'total_spent', 'transactions', 'avg_expense'])
    for k in sorted(monthly):
        t = monthly[k]['total']
        c = monthly[k]['count']
        w.writerow([k, f'{t:.2f}', c, f'{(t/c if c else 0):.2f}'])

# category trends
cat = defaultdict(lambda: {'total': 0.0, 'count': 0})
for row in rows:
    key = row.get('category') or 'Unknown'
    try:
        cat[key]['total'] += float(row['amount'] or 0)
        cat[key]['count'] += 1
    except Exception:
        continue

cat_path = out_dir / 'category_trends.csv'
with cat_path.open('w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['category', 'total_spent', 'transactions'])
    for k,v in sorted(cat.items(), key=lambda x: x[1]['total'], reverse=True):
        w.writerow([k, f'{v["total"]:.2f}', v['count']])

print('Done')
print('Monthly:', monthly_path)
print('Category:', cat_path)
