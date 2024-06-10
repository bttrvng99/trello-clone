import Box from '@mui/material/Box'
import ListColumns from './ListColumns/ListColumns'
import { mapOrder } from '~/utils/sorts'
import
{ DndContext,
  // PointerSensor,
  // MouseSensor,
  // TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  closestCorners,
  // closestCenter,
  pointerWithin,
  // rectIntersection,
  getFirstCollision
} from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '~/customLibraries/DndKitSensors'
import { useCallback, useEffect, useRef, useState } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { cloneDeep, isEmpty } from 'lodash'
import { generatePlaceholderCard } from '~/utils/formatter'

import Column from './ListColumns/Column/Column'
import Card from './ListColumns/Column/ListCards/Card/Card'

const ACTIVE_DRAG_ITEM_TYPE = {
  COLUMN: 'ACTIVE_DRAG_ITEM_TYPE_COLUMN',
  CARD: 'ACTIVE_DRAG_ITEM_TYPE_CARD'
}

function BoardContent({ board, createNewColumn, createNewCard }) {

  // Nếu dùng pointer sensor thì mặc định phải thêm thuộc tính CSS touch-action: 'none' ở các phân tử kéo thả - nhưng vẫn bug
  // const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 10 } })

  // Yêu cầu chuột di chuyển 10px thì mới kích hoạt
  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 10 } })

  // Nhấn giữ 250 ms và dung sai (chênh lệch cảm ứng) là 500 ms thì mới kích hoạt
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 500 } })

  //Ưu tiến kết hợp mouse với touch sensor
  const sensors = useSensors(mouseSensor, touchSensor)

  const [orderedColumns, setOrderedColumns] = useState([])

  // Tại 1 thời điểm chỉ có 1 phần tử được kéo (column hoặc card)
  const [activeDragItemId, setActiveDragItemId] = useState(null)
  const [activeDragItemType, setActiveDragItemType] = useState(null)
  const [activeDragItemData, setActiveDragItemData] = useState(null)
  const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] = useState(null)

  // điểm va chạm cuối cùng (xử lý thuật toán phát hiện va chạm - video 37)
  const lastOverId = useRef(null)

  useEffect(() => {
    setOrderedColumns(mapOrder(board?.columns, board?.columnOrderIds, '_id'))
  }, [board])

  // Tìm 1 column theo cardId
  const findColumnByCardId = (cardId) => {
    // Lưu ý: nên dùng column.cards thay vì column.cardOrderIds vì ở bước handleDragOver sẽ làm dữ liệu cho cards
    // hoàn chỉnh trước rồi tạo cardOrderIds mới
    return orderedColumns.find(column => column?.cards?.map(card => card._id)?.includes(cardId))
  }

  // Function chung xử lý việc cập nhật lại state trong trường hợp di chuyển giữa các column khác nhau
  const moveCardBetweenDifferentColumns = (
    overColumn,
    overCardId,
    active,
    over,
    activeColumn,
    activeDraggingCardId,
    activeDraggingCardData
  ) => {
    setOrderedColumns(prevColumns => {
      // Tìm vị trí (index) của cái overCard trong column đích (nơi activeCard sắp được thả)
      const overCardIndex = overColumn?.cards?.findIndex(card => card._id === overCardId)

      // Logic tính toán cho cardIndex mới lấy ra từ storybook của dnd-kit
      let newCardIndex
      const isBelowOverItem = active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height
      const modifier = isBelowOverItem ? 1 : 0
      newCardIndex = overCardIndex >= 0 ? overCardIndex + modifier : overColumn?.cards?.length + 1

      // Clone mảng OrderedColumnState cũ ra một mảng mới để xử lý data rồi return - cập nhật lại
      // OrderStateColumns mới
      const nextColumns = cloneDeep(prevColumns)
      const nextActiveColumn = nextColumns.find(column => column._id === activeColumn._id)
      const nextOverColumn = nextColumns.find(column => column._id === overColumn._id)

      // NextActiveColumn: Column cũ
      if (nextActiveColumn) {
        // Xoá card ở column active (column ban đầu của card)
        nextActiveColumn.cards = nextActiveColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Thêm placeholder card nếu column rỗng: bị kéo hết card card, không còn cái nào nữa (video 37.2)
        if (isEmpty(nextActiveColumn.cards)) {
          nextActiveColumn.cards = [generatePlaceholderCard(nextActiveColumn)]
        }

        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(card => card._id)
      }

      // NextOverColumn: Column mới
      if (nextOverColumn) {
        // Kiểm tra xem card đang kéo có tồn tại ở overCloumn chưa, nếu có thì cần xoá nó trước
        nextOverColumn.cards =nextOverColumn.cards.filter(card => card._id !== activeDraggingCardId)

        // Phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card
        // giữa 2 column khác nhau
        const rebuild_activeDraggingCardData = {
          ...activeDraggingCardData,
          columnId: nextOverColumn._id
        }
        // TIếp theo là thêm card đang kéo vào overColumn theo vị trí index mới
        nextOverColumn.cards = nextOverColumn.cards.toSpliced(newCardIndex, 0, rebuild_activeDraggingCardData)

        // Xoá placeholder card nếu nó đang tồn tại (video 37.2)
        nextOverColumn.cards = nextOverColumn.cards.filter(card => !card.FE_PlaceholderCard)

        // Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
        nextOverColumn.cardOrderIds = nextOverColumn.cards.map(card => card._id)
      }

      return nextColumns
    })
  }

  // Trigger khi bắt đầu kéo 1 phần tử (drag)
  const handleDragStart = (event) => {
    // console.log('handleDragStart', event)
    setActiveDragItemId(event?.active?.id)
    setActiveDragItemType(event?.active?.data?.current?.columnId ? ACTIVE_DRAG_ITEM_TYPE.CARD :
      ACTIVE_DRAG_ITEM_TYPE.COLUMN)
    setActiveDragItemData(event?.active?.data?.current)

    // Nếu là kéo card thì mới thực hiện hành động set giá trị oldColumn
    if (event?.active?.data?.current.columnId) {
      setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id))
    }
  }

  // Trigger trong quá trình kéo
  const handleDragOver = (event) => {
    // Không làm gì khi kéo column
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return

    //Còn nếu kéo card thì xử lý thêm để có thể kéo card qua lại giữa các column
    // console.log('handleDragOver', event)
    const { active, over } = event

    // Kiểm tra nếu ko tồn tại active hoặc over (kéo ra ngoài phạm vi container) thì return luôn để tránh lỗi
    // (tránh crash trang)
    if (!active || !over) return

    // activeDraggingCard là card đang được kéo
    const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
    // overCard: là card đang tương tác trên hoặc dưới so với card đang kéo ở trên
    const { id: overCardId } = over

    // Tìm 2 column theo card
    const activeColumn = findColumnByCardId(activeDraggingCardId)
    const overColumn = findColumnByCardId(overCardId)

    // Kiểm tra nếu ko tồn tại active hoặc over (kéo ra ngoài phạm vi container) thì return luôn để tránh lỗi
    // (tránh crash trang)
    if (!activeColumn || !overColumn) return

    // Xử lý logic ở đây chỉ khi kéo card qua 2 column khác nhau, còn nếu kéo card trong chính column ban đầu của nó thì không làm gì
    // Vì đây đang là đoạn xử lý lúc kéo (handleDragOver), xử lý lúc kéo xong thì lại là vấn đề khác (handleDragEnd)
    if (activeColumn._id !== overColumn._id) {
      moveCardBetweenDifferentColumns(
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData
      )
    }

  }

  //Trigger khi kết thúc kéo phần tử (drop)
  const handleDragEnd = (event) => {
    // console.log('handleDragEnd', event)
    const { active, over } = event // Lấy giá trị active và over từ kéo thả

    // Kiểm tra nếu ko tồn tại active hoặc over (kéo ra ngoài phạm vi container) thì return luôn để tránh lỗi
    // (tránh crash trang)
    if (!active || !over) return

    // Xử lý kéo thả card
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {

      // activeDraggingCard là card đang được kéo
      const { id: activeDraggingCardId, data: { current: activeDraggingCardData } } = active
      // overCard: là card đang tương tác trên hoặc dưới so với card đang kéo ở trên
      const { id: overCardId } = over

      // Tìm 2 column theo card
      const activeColumn = findColumnByCardId(activeDraggingCardId)
      const overColumn = findColumnByCardId(overCardId)

      // Kiểm tra nếu ko tồn tại active hoặc over (kéo ra ngoài phạm vi container) thì return luôn để tránh lỗi
      // (tránh crash trang)
      if (!activeColumn || !overColumn) return

      // Hành động kéo thả card giữa 2 column khác nhau
      // Phải dùng tới activeDragItemData.columnId hoặc oldColumnWhenDraggingCard._id (set vào state từ bước handleDragStart)
      // chứ không phải activeData trong scope handleDragEnd này vì sau khi đi qua onDragOver tới đây là state của card
      // đã được cập nhật 1 lần rồi.
      if (oldColumnWhenDraggingCard._id !== overColumn._id) {
        moveCardBetweenDifferentColumns(
          overColumn,
          overCardId,
          active,
          over,
          activeColumn,
          activeDraggingCardId,
          activeDraggingCardData
        )
      } else {
        // Hành động két thả card trong cùng một column

        // lấy vị trí cũ từ oldColumnWhenDraggingCard
        const oldCardIndex = oldColumnWhenDraggingCard?.cards?.findIndex(c => c._id === activeDragItemId)
        // lấy vị trí mới từ overColumn
        const newCardIndex = overColumn?.cards?.findIndex(c => c._id === overCardId)

        // Dùng arrayMove vì kéo card trong 1 column thì tương tự với logic kéo cột trong 1 board content
        const dndOrderedCards = arrayMove(oldColumnWhenDraggingCard?.cards, oldCardIndex, newCardIndex)

        setOrderedColumns(prevColumns => {
          // Clone mảng OrderedColumnState cũ ra một mảng mới để xử lý data rồi return - cập nhật lại
          // OrderStateColumns mới
          const nextColumns = cloneDeep(prevColumns)

          // Tìm tới column đang thả
          const targetColumn = nextColumns.find(column => column._id === overColumn._id)

          // Cập nhật lại 2 gra
          targetColumn.cards = dndOrderedCards
          targetColumn.cardOrderIds = dndOrderedCards.map(card => card._id)
          // console.log('targetColumn', targetColumn)

          // Trả về giá trị state mới
          return nextColumns
        })
      }
    }

    // Xử lý kéo thả column trong một cái boardContent
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      // Nếu vị trí sau khi kéo thả khác với vị trí ban đầu
      if (active.id !== over.id) {
        // lấy vị trí cũ từ active
        const oldColumnIndex = orderedColumns.findIndex(c => c._id === active.id)
        // lấy vị trí mới từ over
        const newColumnIndex = orderedColumns.findIndex(c => c._id === over.id)

        // Dùng arrayMove của dnd-kit để sắp xếp lại mảng Columns ban đầu

        const dndOrderedColumns = arrayMove(orderedColumns, oldColumnIndex, newColumnIndex)

        // const dndOrderedColumnsIds = dndOrderedColumns.map(c => c._id)
        // console.log('dndOrderedColumns: ', dndOrderedColumns)
        // console.log('dndOrderedColumnsIds: ', dndOrderedColumnsIds)

        //Cập nhật lại state columns sau khi đã kéo thả
        setOrderedColumns(dndOrderedColumns)
      }
    }

    // Những dữ liệu sau khi kéo thả này luôn phải đưa về giá trị null mặc định ban đầu
    setActiveDragItemId(null)
    setActiveDragItemType(null)
    setActiveDragItemData(null)
    setOldColumnWhenDraggingCard(null)
  }

  /*
    Animation khi thả (drop) phần tử - test bằng cách kéo thả trực tiếp và nhìn phần giữ chố overlay
    (video 32)
  */
  const customDropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: { active: { opacity: '0.5' } } })
  }

  const collisionDetectionStrategy = useCallback((args) => {
    // Trường hợp kéo column thì dùg closestCorners
    if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
      return closestCorners({ ...args })
    }

    // Tìm các điểm giao nhau, va chạm, trả về một mảng các va chạm - intersections với con trỏ
    const pointerIntersections = pointerWithin(args)
    // console.log('pointerIntersections: ', pointerIntersections)

    // Video 37.1: Nếu pointerIntersections là mảng rỗng, return luôn không làm gì
    // Fix triệt để bug flickering của thư viện Dnd-kit trong trường hợp sau:
    // - Kéo 1 card có image cover lên và kéo lên phía trên cùng ra khỏi khu vực kéo thả
    if (!pointerIntersections?.length) return

    // // Thuật toán phát hiện va chạm sẽ trả về một mảng các va chạm ở đáy (Không cần bước này nữa)
    // const intersections = !!pointerIntersections?.length
    //   ? pointerIntersections
    //   : rectIntersection(args)

    // Tìm overId đầu tiên trong các pointerIntersections ở trên
    let overId = getFirstCollision(pointerIntersections, 'id')
    if (overId) {
      // Video 37: Fix flickering
      // Nếu over là column thì sẽ tìm tới cardId gần nhất bên trong khu vực va chạm đó dựa vào
      // thuật toán phát hiện va chạm closestCenter hoặc closestCorners đều được. Tuy nhiên ở đây dùng
      // closestCorners trông mượt mà hơn
      const colludingColumn = orderedColumns.find(column => column._id === overId)
      if (colludingColumn) {
        // console.log('overId Before: ', overId)
        overId = closestCorners({
          ...args,
          droppableContainers: args.droppableContainers.filter(container => {
            return (container.id !== overId) && (colludingColumn?.cardOrderIds?.includes(container.id))
          })
        })[0]?.id
        // console.log('overId After: ', overId)
      }

      lastOverId.current = overId
      return [{ id: overId }]
    }

    return lastOverId.current ? [{ id: lastOverId.current }] : []
  }, [activeDragItemType, orderedColumns])

  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      // Cảm biến: Xem lại video 30
      sensors={sensors}
      // Thuật toán phát hiện va chạm (nếu không có thì card với cover lớn sẽ không kéo qua Column khác được
      // vì lúc này nó đang bị conflict giữa card và column, chúng ta sẽ dùng closestCorners thay vì closestCenter )
      // https://docs.dndkit.com/api-documentation/context-provider/collision-detection-algorithms
      // Update: nếu chỉ dùng closestCorners sẽ có bug flickering + sai dữ liệu (xem video 37)
      //collisionDetection={closestCorners}

      //  Tự custom nâng cao thuật toán phát hiện va chạm (video 37)
      collisionDetection={collisionDetectionStrategy}
    >
      <Box
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? '#34495e' : '#1976d2',
          width: '100%',
          height: (theme) => theme.trello.boardContentHeight,
          p: '10px 0'
        }}
      >
        <ListColumns
          columns={orderedColumns}
          createNewColumn={createNewColumn}
          createNewCard={createNewCard}/>
        <DragOverlay dropAnimation={customDropAnimation}>
          {(!activeDragItemType) && null}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) && <Column column={activeDragItemData}/>}
          {(activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) && <Card card={activeDragItemData}/>}
        </DragOverlay>
      </Box>
    </DndContext>
  )
}

export default BoardContent
