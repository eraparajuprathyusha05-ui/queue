function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-cyan-300/30 border-t-cyan-300" />
    </div>
  );
}

export default LoadingSpinner;
