// Utility functions for creating and removing tooltips

export const createTooltip = (point, event) => {
  // Remove any existing tooltip
  removeTooltip();
  
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.id = 'vector-tooltip';
  
  // Set styles
  tooltip.style.position = 'absolute';
  tooltip.style.left = `${event.clientX + 10}px`;
  tooltip.style.top = `${event.clientY + 10}px`;
  tooltip.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
  tooltip.style.color = 'white';
  tooltip.style.padding = '8px 12px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.fontSize = '14px';
  tooltip.style.zIndex = '1000';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.maxWidth = '300px';
  tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  
  // Enhanced tooltip with more information
  tooltip.innerHTML = `
    <strong style="font-size: 16px; color: ${point.isPrimary ? '#FFC837' : '#FFFFFF'}">
      ${point.word}
    </strong>
    <div style="margin-top: 4px; font-size: 12px; color: #94a3b8;">
      ${point.isPrimary ? 'Primary word' : 'Neighbor word'}
    </div>
    <div style="margin-top: 8px; font-family: monospace; font-size: 12px; color: #cbd5e1; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 2px;">
      ${point.truncatedVector || 'Vector data unavailable'}
    </div>
  `;
  
  document.body.appendChild(tooltip);
  return tooltip;
};

export const removeTooltip = () => {
  const existingTooltip = document.getElementById('vector-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
}; 