import type { NextPage } from 'next'
import { GetStaticProps } from 'next'
import FirebaseUI from '../../components/FirebaseUI'

const Login: NextPage = () => <FirebaseUI />

export const getStaticProps: GetStaticProps = async () => ({
  props: {
    title: '登入',
    withoutLayout: true,
  },
})

export default Login
