export function ErrorMessage({ error }) {
  if (error) {
    return (
      <div className="mt-1 text-red-500">
        <em>{error.message}</em>
      </div>
    )
  }

  return null
}
