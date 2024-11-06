import { createRouter, createWebHistory } from 'vue-router'
import MarketTable from '../components/MarketTable.vue'
import CollectionStats from '../views/CollectionStats.vue'
import TimeSeriesAnalysis from '../views/TimeSeriesAnalysis.vue'
import MarketAnalysis from '../views/MarketAnalysis.vue'
import TrekStarmap from '@/views/TrekStarmap.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  console.log('Navigating from:', from.path, 'to:', to.path)
  return true
})

export default router 