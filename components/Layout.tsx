import { Icon } from '@iconify/react'
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Container,
  Paper,
} from '@mui/material'
import { useRouter } from 'next/router'
import { FC } from 'react'
import { bottomNavigationConfigs } from '../configs/path'
import VocabularySearch from './VocabularySearch'

const Layout: FC = ({ children }) => {
  const { pathname, push } = useRouter()
  return (
    <Box sx={{ pb: 16, pt: 2 }}>
      <Container>{children}</Container>
      <Paper
        elevation={3}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      >
        <BottomNavigation
          showLabels
          value={pathname}
          onChange={(event, value) => {
            return push(value)
          }}
        >
          {bottomNavigationConfigs.map(({ title, pathname, icon }) => (
            <BottomNavigationAction
              key={title}
              label={title}
              value={pathname}
              icon={<Icon icon={icon} />}
            />
          ))}
        </BottomNavigation>
      </Paper>
      <VocabularySearch
        triggerSx={{ position: 'fixed', bottom: 64, right: 16 }}
      />
    </Box>
  )
}

export default Layout
