import { Icon } from '@iconify/react'
import { IconButton } from '@mui/material'
import { FC, useRef } from 'react'

interface Props {
  src: string
}

const Audio: FC<Props> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  return (
    <>
      <IconButton
        onClick={() => {
          const audio = audioRef.current
          if (audio === null) {
            return
          }
          audio.play().catch((error) => {
            console.error(error)
          })
        }}
      >
        <Icon icon="carbon:play-filled" />
      </IconButton>
      <audio ref={audioRef}>
        <source src={src} type="audio/mpeg" />
      </audio>
    </>
  )
}

export default Audio
