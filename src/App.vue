<template>
  <div class="app">
    <div class="shooting-stars">
      <div class="star"></div>
      <div class="star"></div>
      <div class="star"></div>
      <div class="star"></div>
      <div class="star"></div>
      <div class="star"></div>
      <div class="star"></div>
      <div class="star"></div>
    </div>
    
    <nav class="lcars-nav">
      <router-link to="/" class="title-button">SEIVIEW<br>(beta)</router-link>
      <div class="nav-links">
        <router-link to="/" class="nav-link collections">Collections</router-link>
        <router-link to="/time-series" class="nav-link time-series">Time Series</router-link>
        <router-link to="/market-analysis" class="nav-link market-analysis">Market Analysis</router-link>
        <router-link to="/starmap" class="nav-link starmap">Starmap</router-link>
        
        <div class="social-links">
          <a href="https://discord.gg/K9vUgVxm3W" target="_blank" class="social-link discord">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>
          <a href="https://twitter.com/ark7dev" target="_blank" class="social-link twitter">
            <svg class="social-icon" viewBox="0 0 24 24">
              <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733a4.67 4.67 0 0 0 2.048-2.578a9.3 9.3 0 0 1-2.958 1.13a4.66 4.66 0 0 0-7.938 4.25a13.229 13.229 0 0 1-9.602-4.868c-.4.69-.63 1.49-.63 2.342A4.66 4.66 0 0 0 3.96 9.824a4.647 4.647 0 0 1-2.11-.583v.06a4.66 4.66 0 0 0 3.737 4.568a4.692 4.692 0 0 1-2.104.08a4.661 4.661 0 0 0 4.352 3.234a9.348 9.348 0 0 1-5.786 1.995a9.5 9.5 0 0 1-1.112-.065a13.175 13.175 0 0 0 7.14 2.093c8.57 0 13.255-7.098 13.255-13.254c0-.2-.005-.402-.014-.602a9.47 9.47 0 0 0 2.323-2.41z"/>
            </svg>
          </a>
        </div>
      </div>
    </nav>
    
    <router-view></router-view>
  </div>
</template>

<style>
/* Global styles */
@import url('https://fonts.googleapis.com/css2?family=Antonio:wght@100;200;300;400;500;600;700&display=swap');

:root {
  --lcars-font: 'Antonio', sans-serif;
}

body {
  font-family: var(--lcars-font);
  margin: 0;
  padding: 0;
}
</style>

<style scoped>
.app {
  padding: 20px;
  font-family: var(--lcars-font);
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

.lcars-nav {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
}

.title-button {
  background-color: var(--lcars-red);
  color: black;
  padding: 15px;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.8em;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.title-button:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.nav-links {
  display: flex;
  gap: 20px;
  flex-grow: 1;
}

.nav-link {
  padding: 15px 30px;
  border-radius: 20px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.5em;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.collections {
  background-color: var(--lcars-orange);
  color: black;
}

.time-series {
  background-color: var(--lcars-pink);
  color: black;
}

.market-analysis {
  background-color: var(--lcars-blue);
  color: black;
}

.starmap {
  background-color: var(--lcars-purple);
  color: black;
}

.nav-link:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.router-link-active.collections {
  box-shadow: 0 0 15px var(--lcars-orange);
}

.router-link-active.time-series {
  box-shadow: 0 0 15px var(--lcars-pink);
}

.router-link-active.market-analysis {
  box-shadow: 0 0 15px var(--lcars-blue);
}

.router-link-active.starmap {
  box-shadow: 0 0 15px var(--lcars-purple);
}

.social-links {
  display: flex;
  gap: 10px;
  margin-left: auto; /* Push social links to the right */
}

.social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.2s;
}

.social-icon {
  width: 24px;
  height: 24px;
  fill: black;
}

.discord {
  background-color: #5865F2;
}

.twitter {
  background-color: #1DA1F2;
}

.social-link:hover {
  transform: scale(1.1);
  filter: brightness(1.1);
}

/* Shooting stars container */
.shooting-stars {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 180px; /* Match nav height (including padding) */
  z-index: 0;
  pointer-events: none;
}

/* Individual star styling */
.star {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, #ffffff, transparent);
  border-radius: 50%;
  animation: shoot 6s linear infinite; /* Doubled from 3s to 6s to slow down */
  opacity: 0;
}

/* Position each star differently */
.star:nth-child(1) { top: 20%; right: -100px; width: 100px; animation-delay: 0s; }
.star:nth-child(2) { top: 45%; right: -150px; width: 150px; animation-delay: 0.8s; }
.star:nth-child(3) { top: 30%; right: -80px; width: 80px; animation-delay: 1.6s; }
.star:nth-child(4) { top: 65%; right: -120px; width: 120px; animation-delay: 2.4s; }
.star:nth-child(5) { top: 15%; right: -130px; width: 130px; animation-delay: 3.2s; }
.star:nth-child(6) { top: 55%; right: -90px; width: 90px; animation-delay: 4.0s; }
.star:nth-child(7) { top: 35%; right: -110px; width: 110px; animation-delay: 4.8s; }
.star:nth-child(8) { top: 25%; right: -140px; width: 140px; animation-delay: 5.6s; }

/* Shooting animation */
@keyframes shoot {
  0% {
    transform: translateX(0) scale(1);
    opacity: 0;
  }
  1% {
    opacity: 1;
  }
  30% {
    opacity: 1;
  }
  60% {
    opacity: 0;
  }
  100% {
    transform: translateX(-200vw) scale(0.2);
    opacity: 0;
  }
}

/* Ensure all content stays above stars */
.lcars-nav,
.router-view {
  position: relative;
  z-index: 1;
}
</style>

