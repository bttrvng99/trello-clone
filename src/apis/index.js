import axios from 'axios'
import { API_ROOT } from '~/utils/constants'

/**
 * Lưu ý:
 * Tất cả các function bên dưới không dùng try-catch vì làm như vậy với mọi request sẽ gây ra việc dưa thừa code try-catch quá nhiều
 * Giải pháp Clean code gọn gàng là sẽ try-catch tập trung tại một nơi bằng cách tận dụng Interceptors của axios
 * (Interceptors là cách đánh chặn vào giữa request hoặc response để xử lý logic theo mong muốn)
 */

export const fetchBoardDetailsAPI = async (boardId) => {
  const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`)
  // Axios trả về kết quả qua property data
  return response.data
}