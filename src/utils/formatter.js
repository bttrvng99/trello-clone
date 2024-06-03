export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

/*
  * Video 37.2: Cách xử lý bug logic thư viện dnd-kit khi column rỗng:
  * Phía FE sẽ tự tạo ra một card đặc biệt: Placeholder card, không liên quan tới backend
  * Card đặc biệt này sẽ được ẩn ở giao diện UI người dùng
  * Cấu trúc Id của card này để unique rất đơn giản, không cần làm random phức tạp:
  * 'columnId-placeholder-card' (mỗi column chỉ có thể có tối đa một cái placeholder card)
  * Quan trọng khi tạo: phải đầy đủ (_id, boardId, columnId, FE_placeholderCard)
*/
export const generatePlaceholderCard = (column) => {
  return {
    _id: `${column?._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}
