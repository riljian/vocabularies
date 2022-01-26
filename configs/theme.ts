import { createTheme } from '@mui/material'

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        svg.iconify {
          font-size: 1.5em;
        }
      `,
    },
  },
})

export default theme
