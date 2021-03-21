import styles from '../styles/Home.module.css'
import dynamic from "next/dynamic";
const App = dynamic(() => import("../src/components/App"), { ssr: false });


export default function Home() {
  return (
    <div className={styles.container}>

        <App />

    </div>
  )
}
