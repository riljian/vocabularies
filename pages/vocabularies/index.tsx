import { Icon } from '@iconify/react'
import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material'
import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import { useState } from 'react'
import { bottomNavigationConfigs } from '../../configs/path'

const { title } = bottomNavigationConfigs[0]
const Vocabulary: NextPage = () => {
  const [{ view }, setState] = useState(() => ({ view: 'table' }))
  return (
    <Stack>
      <Box sx={{ alignSelf: 'flex-end' }}>
        <ToggleButtonGroup
          exclusive
          value={view}
          onChange={(event, newView) => {
            setState((s) => ({ ...s, view: newView }))
          }}
        >
          <ToggleButton value="table">
            <Icon icon="codicon:table" />
          </ToggleButton>
          <ToggleButton value="card">
            <Icon icon="system-uicons:card-view" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Stack>
  )
}

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    title,
  },
})

export default Vocabulary
