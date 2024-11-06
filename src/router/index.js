import { createRouter, createWebHistory } from 'vue-router'
import MarketTable from '../components/MarketTable.vue'
import CollectionStats from '../views/CollectionStats.vue'
import TimeSeriesAnalysis from '../views/TimeSeriesAnalysis.vue'
import MarketAnalysis from '../views/MarketAnalysis.vue'
import TrekStarmap from '@/views/TrekStarmap.vue'
import AboutPage from '@/views/AboutPage.vue'
import { trackRouter } from 'vue-gtag-next'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: MarketTable
  },
  {
    path: '/collection/:slug',
    name: 'CollectionStats',
    component: CollectionStats,
    props: true
  },
  {
    path: '/time-series',
    name: 'TimeSeriesAnalysis',
    component: TimeSeriesAnalysis
  },
  {
    path: '/market-analysis',
    name: 'MarketAnalysis',
    component: MarketAnalysis
  },
  {
    path: '/starmap',
    name: 'TrekStarmap',
    component: TrekStarmap
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

trackRouter(router)

router.beforeEach((to, from) => {
  console.log('Navigating from:', from.path, 'to:', to.path)
  return true
})

export default router 