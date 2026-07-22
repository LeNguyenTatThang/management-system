export default function PageContainer({ children }) {
  return (
    <div className="w-full max-w-full min-w-0 mx-auto px-4 max-w-1440px mx-auto">
      {children}
    </div>
  );
}
