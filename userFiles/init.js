resizeCanvas();
setDeviceTouchStatus(false);

window.addEventListener("resize", resizeCanvas, false);

window.addEventListener("mousemove", handleMouseMove, false);

window.addEventListener("touchstart", handleTouchStart, false);
window.addEventListener("touchmove", handleTouchMove, false);
window.addEventListener("touchend", handleTouchEnd, false);

window.requestAnimationFrame(animate);

setInterval(sendMoveRequest, 50);

//setInterval(debugLog, 1000);
