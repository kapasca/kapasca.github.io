const nameText = document.querySelector(".alias");
const letters = nameText.querySelectorAll("span");
const profilePhoto = document.querySelector(".profile-photo");
const links = document.querySelector(".links");
const link = document.querySelectorAll(".link");

let delay = 3000;

letters.forEach((letter) => {
  setTimeout(() => {
    letter.classList.remove("hidden");
  }, delay);
  delay += 150;
});

delay += 500;

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
