document.querySelectorAll(".banner-list").forEach((banner) => {
  banner.addEventListener("click", function () {
    const imgSrc = this.querySelector("img").getAttribute("src");
    const virtualLightbox = document.querySelector(".virtual-light-box");
    const bannerListItems = Array.from(document.querySelectorAll(".banner-list"));

    bannerListItems.forEach((item) => {
      item.classList.remove("highlight");
    });

    virtualLightbox.classList.remove("show");
    virtualLightbox.classList.add("hide");

    setTimeout(() => {
      virtualLightbox.classList.add("show");
      virtualLightbox.classList.remove("hide");
      virtualLightbox.innerHTML = `<img src="${imgSrc}" alt="Selected Image">`;

      const correspondingBanner = bannerListItems.find((item) => item.querySelector("img").getAttribute("src") === imgSrc);
      if (correspondingBanner) {
        correspondingBanner.classList.add("highlight");
      }
    }, 1000);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const bannerListItems = Array.from(document.querySelectorAll(".banner-list"));
  const virtualLightbox = document.querySelector(".virtual-light-box");
  const playButton = document.querySelector(".play-button");
  const pauseButton = document.querySelector(".pause-button");
  let currentIndex = -1;
  let intervalId;

  function showNextImage() {
    const nextIndex = (currentIndex + 1) % bannerListItems.length;
    const imgSrc = bannerListItems[nextIndex].querySelector("img").getAttribute("src");

    bannerListItems.forEach((item) => {
      item.classList.remove("highlight");
    });

    virtualLightbox.classList.remove("show");
    virtualLightbox.classList.add("hide");

    setTimeout(() => {
      virtualLightbox.classList.add("show");
      virtualLightbox.classList.remove("hide");
      virtualLightbox.innerHTML = `<img src="${imgSrc}" alt="Selected Image">`;

      const correspondingBanner = bannerListItems.find((item) => item.querySelector("img").getAttribute("src") === imgSrc);
      if (correspondingBanner) {
        correspondingBanner.classList.add("highlight");
      }
    }, 1000);

    currentIndex = nextIndex;
  }

  function startSlideshow() {
    showNextImage();
    intervalId = setInterval(showNextImage, 5000);
    playButton.style.display = "none";
    pauseButton.style.display = "inline-block";
  }

  function stopSlideshow() {
    clearInterval(intervalId);
    playButton.style.display = "inline-block";
    pauseButton.style.display = "none";
  }

  playButton.addEventListener("click", startSlideshow);
  pauseButton.addEventListener("click", stopSlideshow);

  bannerListItems.forEach((banner) => {
    banner.addEventListener("click", function () {
      const imgSrc = this.querySelector("img").getAttribute("src");

      bannerListItems.forEach((item) => {
        item.classList.remove("highlight");
      });

      virtualLightbox.classList.remove("show");
      virtualLightbox.classList.add("hide");

      setTimeout(() => {
        virtualLightbox.classList.add("show");
        virtualLightbox.classList.remove("hide");
        virtualLightbox.innerHTML = `<img src="${imgSrc}" alt="Selected Image">`;

        const correspondingBanner = bannerListItems.find((item) => item.querySelector("img").getAttribute("src") === imgSrc);
        if (correspondingBanner) {
          correspondingBanner.classList.add("highlight");
        }
      }, 1000);

      stopSlideshow();
    });
  });

  startSlideshow();
});
