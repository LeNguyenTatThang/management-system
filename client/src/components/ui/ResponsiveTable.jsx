export default function ResponsiveTable({ children }) {
  return (
    <div className="w-full min-w-0">
      <div className="table-container">
        <table>
          {children}
        </table>
      </div>
    </div>
  );
}
