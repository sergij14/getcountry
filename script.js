import "regenerator-runtime/runtime";
import "core-js/stable";

("use strict");

const countriesContainer = document.querySelector(".countries");

///////////////////////////////////////

const renderCountry = function (data, className = "") {
  const html = `<article class="country ${className}">
    <img class="country__img" src="${data.flag}" />
    <div class="country__data">
      <h3 class="country__name">${data.name}</h3>
      <h4 class="country__region">${data.region}</h4>
      <p class="country__row"><span>👫</span>${(
        +data.population / 1000000
      ).toFixed(1)}</p>
      <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
      <p class="country__row"><span>💰</span>${data.currencies[0].name}</p>
    </div>
  </article>`;
  countriesContainer.insertAdjacentHTML("beforeend", html);
};

const renderError = function (msg) {
  countriesContainer.insertAdjacentHTML(
    "beforeend",
    `<p class="error">${msg}</p>`
  );
};

const getJson = function (url, errMsg = "something went wrong") {
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`${errMsg}, ${response.status}`);
    }
    return response.json();
  });
};

const getdata = function (country) {
  getJson(
    `https://restcountries.eu/rest/v2/name/${country}`,
    "country not found"
  )
    .then((data) => {
      renderCountry(data[0]);
      const neighbours = data[0].borders;

      if (!data[0].borders[0]) {
        throw new Error(`No neighbours found for ${country}`);
      }

      neighbours.map((n) => {
        return fetch(`https://restcountries.eu/rest/v2/alpha/${n}`)
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            document
              .querySelector(".neighs")
              .insertAdjacentText("beforeend", `${data.name} | `);
          });
      });
      countriesContainer.insertAdjacentHTML(
        "afterend",
        `<p class="neighs">All Neighbours:<br></p>`
      );

      return getJson(
        `https://restcountries.eu/rest/v2/alpha/${data[0].borders[0]}`
      );
    })
    .then((data) => renderCountry(data, "neighbour"))
    .catch((err) => renderError(err))
    .finally(() => {
      countriesContainer.style.opacity = 1;
      document.querySelector(".form").style.display = "none";
      countriesContainer.insertAdjacentHTML(
        "beforebegin",
        `<p class="rel"><button class="rel__btn" onClick="window.location.reload();">Reload</button></p>`
      );
    });
};

const form = document.querySelector(".form");

const getCountry = function (e) {
  e.preventDefault();
  const inputVal = document.getElementById("input").value;
  getdata(inputVal);
};

form.addEventListener("submit", getCountry, false);
