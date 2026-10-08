import { formatDate, formatMoney } from '../format';

export default function TransactionList({
  items,
  total,
  page,
  pages,
  onPage,
  filtered,
  onEdit,
  onDelete,
}) {
  return (
    <div>
      {items.length === 0 ? (
        <p className="muted">
          {filtered
            ? 'No transactions match these filters.'
            : 'No transactions this month. Add one to get started.'}
        </p>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th className="num">Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t._id}>
                    <td>{formatDate(t.date)}</td>
                    <td>{t.category}</td>
                    <td>{t.description || '-'}</td>
                    <td className={`num ${t.type}`}>
                      {t.type === 'expense' ? '-' : '+'}
                      {formatMoney(t.amount)}
                    </td>
                    <td className="row-actions">
                      <button className="link" onClick={() => onEdit(t)}>
                        Edit
                      </button>
                      <button className="link danger" onClick={() => onDelete(t._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pager">
            <span className="muted">
              Page {page} of {pages} ({total} {total === 1 ? 'transaction' : 'transactions'})
            </span>
            <div>
              <button className="btn" disabled={page <= 1} onClick={() => onPage(page - 1)}>
                Previous
              </button>
              <button className="btn" disabled={page >= pages} onClick={() => onPage(page + 1)}>
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
