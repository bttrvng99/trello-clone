import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VpnLockIcon from '@mui/icons-material/VpnLock'
import AddToDriveIcon from '@mui/icons-material/AddToDrive'
import BoltIcon from '@mui/icons-material/Bolt'
import FilterListIcon from '@mui/icons-material/FilterList'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import { Tooltip } from '@mui/material'
import Button from '@mui/material/Button'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { capitalizeFirstLetter } from '~/utils/formatter'

const MENU_STYLES = {
  color: 'white',
  bgcolor: 'transparent',
  border: 'none',
  paddingX: '5px',
  borderRadius: '4px',
  '.MuiSvgIcon-root': {
    color: 'white'
  },
  '&:hover': {
    bgcolor: 'primary.50'
  }
}

function BoardBar({ board }) {
  return (
    <Box
      sx={{
        width: '100%',
        height: (theme) => theme.trello.boardBarHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        overflowX: 'auto',
        paddingX: 2,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#34495e' : '#1976d2')
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Chip
          sx={MENU_STYLES}
          icon={<DashboardIcon />}
          label={board?.title}
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<VpnLockIcon />}
          label={capitalizeFirstLetter(board?.type)}
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<AddToDriveIcon />}
          label='Add to Google Drive'
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<BoltIcon />}
          label='Automation'
          clickable
        />
        <Chip
          sx={MENU_STYLES}
          icon={<FilterListIcon />}
          label='Filter'
          clickable
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant='outlined'
          startIcon={<PersonAddIcon />}
          sx={{
            color: 'white',
            borderColor: 'white',
            '&:hover': { borderColor: 'white' }
          }}
        >
          Invite
        </Button>
        <AvatarGroup
          max={7}
          sx={{
            gap: '10px',
            '& .MuiAvatar-root': {
              width: 34,
              height: 34,
              fontSize: 16,
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              '&:first-of-type': { bgcolor: '#a4b0be' }
            }
          }}
        >
          <Tooltip title='Thành Trung'>
            <Avatar
              alt='Thành Trung'
              src='https://lh3.googleusercontent.com/a/ACg8ocIpc30hUl6l-llop3FW_Gdhcr6ZAcT1-CnWYKzk_Z0bkdb5108=s360-c-no'
              // sx={{ height: '30px', width: '30px' }}
            />
          </Tooltip>
          <Tooltip title='Remy Sharp'>
            <Avatar
              alt='Remy Sharp'
              src='https://mui.com/static/images/avatar/1.jpg'
              // sx={{ height: '30px', width: '30px' }}
            />
          </Tooltip>
          <Tooltip title='Travis Howard'>
            <Avatar
              alt='Travis Howard'
              src='https://mui.com/static/images/avatar/2.jpg'
              // sx={{ height: '30px', width: '30px' }}
            />
          </Tooltip>
          <Tooltip title='Cindy Baker'>
            <Avatar
              alt='Cindy Baker'
              src='https://mui.com/static/images/avatar/3.jpg'
              // sx={{ height: '30px', width: '30px' }}
            />
          </Tooltip>
          <Tooltip title='Thành Trung'>
            <Avatar
              alt='Thành Trung'
              src='https://lh3.googleusercontent.com/a/ACg8ocIpc30hUl6l-llop3FW_Gdhcr6ZAcT1-CnWYKzk_Z0bkdb5108=s360-c-no'
              // sx={{ height: '30px', width: '30px' }}
            />
          </Tooltip>
          <Tooltip title='Remy Sharp'>
            <Avatar
              alt='Remy Sharp'
              src='https://mui.com/static/images/avatar/1.jpg'
              // sx={{ height: '30px', width: '30px' }}
            />
          </Tooltip>
          <Tooltip title='Travis Howard'>
            <Avatar
              alt='Travis Howard'
              src='https://mui.com/static/images/avatar/2.jpg'
              // sx={{ height: '30px', width: '30px' }}
            />
          </Tooltip>
          <Tooltip title='Cindy Baker'>
            <Avatar
              alt='Cindy Baker'
              src='https://mui.com/static/images/avatar/3.jpg'
              // sx={{ height: '30px', width: '30px' }}
            />
          </Tooltip>
        </AvatarGroup>
      </Box>
    </Box>
  )
}

export default BoardBar
