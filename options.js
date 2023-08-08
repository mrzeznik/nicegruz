function updateLabel(rangeInputId, rangeValueId) {
  var rangeInput = document.getElementById(rangeInputId);
  var rangeValue = document.getElementById(rangeValueId);
  rangeValue.textContent = Number(rangeInput.value).toLocaleString("PL");
}

function attachEventListeners(rangeInputId, rangeValueId) {
  var rangeInput = document.getElementById(rangeInputId);
  rangeInput.addEventListener("input", function() {
    updateLabel(rangeInputId, rangeValueId);
  });
}

// Call the updateLabel function on page load to set the initial values
window.addEventListener("load", function() {
  updateLabel("yearly_income", "yearly_income_output");
  attachEventListeners("yearly_income", "yearly_income_output");
  updateLabel("max_income", "max_income_output");
  attachEventListeners("max_income", "max_income_output");
  updateLabel("max_car_age", "max_car_age_output");
  attachEventListeners("max_car_age", "max_car_age_output");
  updateLabel("yearly_mileage", "yearly_mileage_output");
  attachEventListeners("yearly_mileage", "yearly_mileage_output");
  updateLabel("max_mileage", "max_mileage_output");
  attachEventListeners("max_mileage", "max_mileage_output");
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("optionsForm");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const limit = parseInt(form.limit.value, 10);
    const xpath = form.xpath.value.trim();
    const xpath_price = form.xpath_price.value.trim();
    const xpath_mileage = form.xpath_mileage.value.trim();
    const xpath_age = form.xpath_age.value.trim();
    const xpath_offer_link = form.xpath_offer_link.value.trim();

    const yearly_income = parseInt(form.yearly_income.value.trim(), 10);
    const max_income = parseInt(form.max_income.value.trim(), 10);
    const max_car_age = parseInt(form.max_car_age.value.trim(), 10);
    const yearly_mileage = parseInt(form.yearly_mileage.value.trim(), 10);
    const max_mileage = parseInt(form.max_mileage.value.trim(), 10);

    browser.storage.local.set({
      limit,
      xpath,
      xpath_price,
      xpath_mileage,
      xpath_age,
      xpath_offer_link,
      yearly_income,
      max_income,
      max_car_age,
      yearly_mileage,
      max_mileage
    });
    window.close();
  });

  // Load the default values for the limit and XPath
  browser.storage.local.get(["limit",
    "xpath",
    "xpath_price",
    "xpath_mileage",
    "xpath_age",
    "xpath_offer_link",
    "yearly_income",
    "max_income",
    "max_car_age",
    "yearly_mileage",
    "max_mileage"
  ]).then((data) => {
    form.limit.value = data.limit || 50; // Default limit: 50
    form.xpath.value = data.xpath || "//main/article";
    form.xpath_price.value = data.xpath_price || ".//div/div/span";
    form.xpath_mileage.value = data.xpath_mileage || ".//div/div/ul/li[2]";
    form.xpath_age.value = data.xpath_age || ".//div/div/ul/li[1]";
    form.xpath_offer_link.value = data.xpath_offer_link || ".//div[1]/h2/a";

    form.yearly_income.value = data.yearly_income || 100000;
    form.max_income.value = data.max_income || 55;
    form.max_car_age.value = data.max_car_age || 15;
    form.yearly_mileage.value = data.yearly_mileage || 12000;
    form.max_mileage.value = data.max_mileage || 250000;

    yearly_income_output.innerHTML = Number(data.yearly_income).toLocaleString('PL');
    max_income_output.innerHTML = Number(data.max_income);
    max_car_age_output.innerHTML = Number(data.max_car_age).toLocaleString('PL');
    yearly_mileage_output.innerHTML = Number(data.yearly_mileage).toLocaleString('PL');
    max_mileage_output.innerHTML = Number(data.max_mileage).toLocaleString('PL');
  });
});