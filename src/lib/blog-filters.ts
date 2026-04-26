export function visiblePostFilter() {
  return {
    published: true,
    publishedAt: { $lte: new Date() },
  }
}
