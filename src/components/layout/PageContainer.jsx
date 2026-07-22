export default function PageContainer({ children }) {
  return (
    <div className="w-full max-w-full min-w-0" style={{ maxWidth: '1440px', margin: '0 auto', padding: 'var(--spacing-4)' }}>
      {children}
    </div>
  );
}
