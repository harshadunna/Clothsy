import { useState } from "react";
import HomeSectionCard from "../HomeSectionCard/HomeSectionCard";
import { Button } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

function HomeSectionCarousel({ data, sectionName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemsPerPage = 5;

  const slidePrev = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };

  const slideNext = () => {
    setActiveIndex((prev) =>
      Math.min(prev + 1, data.length - itemsPerPage)
    );
  };

  return (
    <div className="relative px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-extrabold text-gray-900 py-5">
        {sectionName}
      </h2>
      <div className="relative border p-5 overflow-hidden">
        <div
          style={{
            display: "flex",
            transition: "transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)",
            transform: `translateX(-${activeIndex * (100 / itemsPerPage)}%)`,
          }}
        >
          {data.map((item, index) => (
            <div
              key={index}
              style={{
                minWidth: `${100 / itemsPerPage}%`,
                flexShrink: 0,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <HomeSectionCard product={item} />
            </div>
          ))}
        </div>

        {/* Left arrow (previous) */}
        {activeIndex > 0 && (
          <Button
            onClick={slidePrev}
            variant="contained"
            className="z-50"
            sx={{
              position: "absolute",
              top: "50%",
              left: "0rem",
              transform: "translateY(-50%)",
              bgcolor: "white",
              boxShadow: 3,
              minWidth: "40px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              "&:hover": { bgcolor: "#f0f0f0" },
              transition: "all 0.3s ease",
            }}
            aria-label="prev"
          >
            <KeyboardArrowLeftIcon sx={{ color: "#000" }} />
          </Button>
        )}

        {/* Right arrow (next) */}
        {activeIndex < data.length - itemsPerPage && (
          <Button
            onClick={slideNext}
            variant="contained"
            className="z-50"
            sx={{
              position: "absolute",
              top: "50%",
              right: "0rem",
              transform: "translateY(-50%)",
              bgcolor: "white",
              boxShadow: 3,
              minWidth: "40px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              "&:hover": { bgcolor: "#f0f0f0" },
              transition: "all 0.3s ease",
            }}
            aria-label="next"
          >
            <KeyboardArrowRightIcon sx={{ color: "#000" }} />
          </Button>
        )}
      </div>
    </div>
  );
}

export default HomeSectionCarousel;
