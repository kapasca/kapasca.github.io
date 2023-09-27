const nameText = document.querySelector(".alias");
const letters = nameText.querySelectorAll("span");
const profilePhoto = document.querySelector(".profile-photo");
const links = document.querySelector(".links");
const link = document.querySelectorAll(".link");
const content = document.querySelector(".content");

let delay = 200;

letters.forEach((letter) => {
  setTimeout(() => {
    letter.classList.remove("hidden");
  }, delay);
  delay += 100;
});

delay += 150;

setTimeout(() => {
  links.classList.remove("visibility-hidden");
  links.classList.add("visibility-true");
}, delay);

link.forEach((single_link) => {
  setTimeout(() => {
    single_link.classList.add("link-ready");
  }, delay);
  delay += 100;
});

delay += 100;

setTimeout(() => {
  content.classList.remove("visibility-hidden");
  content.classList.add("visibility-true");
}, delay);
