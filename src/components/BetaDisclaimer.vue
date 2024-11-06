<template>
  <div class="beta-disclaimer">
    <div class="disclaimer-content">
      <div class="beta-tag">BETA VERSION</div>
      <p class="disclaimer-text">
        This is a beta release. Data and functionality may be incomplete or subject to change.
      </p>
    </div>
  </div>
</template>

<style scoped>
.beta-disclaimer {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 15px;
  background: rgba(255, 165, 0, 0.1);
  border: 1px solid var(--lcars-orange);
  z-index: 10;
}

.disclaimer-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.beta-tag {
  background-color: var(--lcars-orange);
  color: black;
  padding: 5px 15px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9em;
  letter-spacing: 1px;
}

.disclaimer-text {
  color: var(--lcars-orange);
  text-align: center;
  margin: 0;
  font-size: 0.9em;
}
</style> 