<template>
  <div class="about-container">
    <div class="lcars-header-bar">
      <div class="title">About</div>
    </div>
    <div class="content">
      <div class="about-section">
        <h2>About SeiView</h2>
        <p>
          SeiView is a comprehensive analytics platform for the Sei Network NFT ecosystem.<br>
          Our mission is to provide real-time market insights and data visualization tools <br>
          to help users make informed decisions.
        </p>
      </div>

      
      <div class="about-section">
        <h2>Important Beta Version Note!</h2>
        <p>
          SeiView's pipeline is currently in beta. This means that some data may be incomplete<br>
          or inaccurate, and currently only a 24-hour lookback with 1 hour resolution is available.<br>
          Further filters to include a weekly and monthly lookback are planned.
        </p>
      </div>

      <div class="about-section">
        <h2>Features</h2>
        <ul>
          <li>Real-time NFT market data</li>
          <li>Collection statistics and trends</li>
          <li>Market analysis tools</li>
          <li>Time series data visualization</li>
        </ul>
      </div>

      <div class="about-section">
        <h2>Contact</h2>
        <p>
          For support or inquiries, reach out to us on:
          <a href="https://twitter.com/ark7dev" target="_blank">Twitter</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage'
}
</script>

<style scoped>
.about-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.lcars-header-bar {
  background-color: var(--lcars-orange);
  height: 40px;
  border-radius: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.title {
  color: black;
  font-size: 1.5em;
  font-weight: 600;
  letter-spacing: 2px;
}

.content {
  background-color: var(--lcars-background);
  padding: 20px;
  border-radius: 10px;
}

.about-section {
  margin-bottom: 30px;
}

h2 {
  color: var(--lcars-orange);
  margin-bottom: 15px;
  font-size: 1.8em;
}

p {
  color: var(--lcars-text);
  line-height: 1.6;
  margin-bottom: 15px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  color: var(--lcars-text);
  margin-bottom: 10px;
  padding-left: 20px;
  position: relative;
}

li::before {
  content: "•";
  color: var(--lcars-orange);
  position: absolute;
  left: 0;
}

a {
  color: var(--lcars-blue);
  text-decoration: none;
  transition: color 0.3s ease;
}

a:hover {
  color: var(--lcars-orange);
}
</style> 