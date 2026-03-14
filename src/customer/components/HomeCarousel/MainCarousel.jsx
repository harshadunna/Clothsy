import React, { useState, useEffect, useCallback } from "react";
import { homeCarouselData } from "./MainCarouselData";
import { useNavigate } from "react-router-dom";

const MainCarousel = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) =>
      prev === homeCarouselData.length - 1 ? 0 : prev + 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) =>
      prev === 0 ? homeCarouselData.length - 1 : prev - 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  useEffect(() => {
    const interval = setInterval(goToNext, 2000);
    return () => clearInterval(interval);
  }, [goToNext]);

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          transition: "transform 0.5s ease-in-out",
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {homeCarouselData.map((item, index) => (
          <img
            key={index}
            className="cursor-pointer w-full flex-shrink-0 object-cover rounded-md"
            style={{ height: "30rem", minWidth: "100%" }}
            onClick={() => navigate(item.path)}
            src={item.image}
            alt={`Slide ${index + 1}`}
            draggable={false}
          />
        ))}
      </div>

      {/* Navigation dots */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
        }}
      >
        {homeCarouselData.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              border: "2px solid white",
              background: currentIndex === index ? "white" : "transparent",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Previous button */}
      <button
        onClick={goToPrev}
        style={{
          position: "absolute",
          top: "50%",
          left: "16px",
          transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.7)",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          cursor: "pointer",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Previous slide"
      >
        ‹
      </button>

      {/* Next button */}
      <button
        onClick={goToNext}
        style={{
          position: "absolute",
          top: "50%",
          right: "16px",
          transform: "translateY(-50%)",
          background: "rgba(255,255,255,0.7)",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          cursor: "pointer",
          fontSize: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-label="Next slide"
      >
        ›
      </button>
    </div>
  );
};

export default MainCarousel;
