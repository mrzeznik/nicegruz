"use strict";


class Car {
  #carYear;
  #mileage;
  #price;

  static init(carYear, carMileage, carPrice) {
    if (isNaN(carPrice) || carPrice < 0) throw new Error(`Car price cannot be NaN or < 0: ${carPrice}`);
    if (isNaN(carMileage) || carMileage < 0) throw new Error(`Car mileage cannot be NaN or < 0: ${carMileage}`);
    if (isNaN(carYear) || carYear < 1900) throw new Error(`Car year cannot be NaN or < 1900: ${carYear}`);
    var car = new Car();

    car.#carYear = Number(carYear);
    car.#mileage = Number(carMileage);
    car.#price = Number(carPrice);

    return car;
  }

  get Age() { return new Date().getFullYear() - Number(this.#carYear); }
  get Mileage() { return this.#mileage; }
  get Price() { return this.#price; }
}

class Sanity {
  #yearlyIncome;
  #maxIncome; // maximum proportion of income
  #maxCarAge;
  #yearlyMileage;
  #maxMileage;

  static init(yearly_income, max_income, max_car_age = 15, yearly_mileage = 12000, max_mileage = 250000) {
    const sanity = new Sanity();

    sanity.yearlyIncome = Number(yearly_income);
    sanity.maxIncome = Number(max_income);
    sanity.maxCarAge = Number(max_car_age);
    sanity.yearlyMileage = Number(yearly_mileage);
    sanity.maxMileage = Number(max_mileage);

    return sanity;
  }

  usableYearsByAge(car) {
    return Math.max(this.maxCarAge - car.Age, 1); // minimum is 1 year usable
  }

  usableMileage(car) {
    return Math.max(this.maxMileage - car.Mileage, 1); // maksymaly przebieg z rozsadku - obecny
  }

  usableYearsAvg(car) {
    const carUsableYearsByMileage = Math.max(Math.round(this.usableMileage(car) / this.yearlyMileage), 1);

    return Math.round((this.usableYearsByAge(car) + carUsableYearsByMileage) / 2);
  }

  isReasonable(car) {
    const carUsableMileage = this.usableMileage(car);
    const carUsableYearsByAge = this.usableYearsByAge(car);
    const carUsableYearsByMileage = Math.max(Math.round(carUsableMileage / this.yearlyMileage), 1);
    const carExpectedMileageByAge = carUsableYearsByAge * this.yearlyMileage;
    const carUsableMileageAvg = Math.round(((carUsableMileage + carExpectedMileageByAge) / 2) / 10) * 10;
    const maxYearlyIncomePortion = (0.11 - (car.Age / 1000));

    console.info(`car usable years by age: ${carUsableYearsByAge}, usable years by mileage: ${carUsableYearsByMileage}, avg years: ${this.usableYearsAvg(car)}, usable mileage by limit: ${carUsableMileage}, expected mileage by year: ${carExpectedMileageByAge}, avg: ${carUsableMileageAvg}`);

    var reasonableText = [];

    if (car.Price > (this.maxIncome / 100) * this.yearlyIncome)
      reasonableText.push("ZA DROGO DO ZAROBKOW");

    if (car.Mileage > this.maxMileage) {
      reasonableText.push("PRZEBIEG PONAD LIMIT");
      // console.log(`car mileage > max: ${car.Mileage} > ${this.maxMileage}`);
    }

    if (car.Age > this.maxCarAge)
      reasonableText.push("ZA STARY");

    if ((this.usableYearsAvg(car) < this.maxCarAge * 0.5) && carUsableYearsByAge * 1.3 < this.usableYearsAvg(car)) {
      console.log(`car carUsableYearsByAge < usableYearsAvg: ${carUsableYearsByAge * 1.3} < ${this.usableYearsAvg(car)}`);
      reasonableText.push("MALY POZOSTALY UZYTECZNY CZAS");
    }

    if ((carUsableMileage * 1.2) < carUsableMileageAvg)
      reasonableText.push("MALY POZOSTALY PRZEBIEG");

    if ((car.Price / this.usableYearsAvg(car)) > this.yearlyIncome * maxYearlyIncomePortion) {
      reasonableText.push("DROGO MIESIECZNIE");
      console.info(`car price exceeds ${maxYearlyIncomePortion}% of monthly income`);
    }

    if (reasonableText.length)
      return reasonableText.join(', ');

    return "✔";
  }

  monthlyCost(car) {
    // can compare to left car mileage too and select lower value

    return Math.round(((car.Price / this.usableYearsAvg(car)) / 12) / 50) * 50; // round to 50
  }
}


function modifyDOM(limit, xpath, xpath_price, xpath_mileage, xpath_age, xpath_offer_link, sanity) {
  const master_offer = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  console.log(`Found: ${master_offer.snapshotLength} offers`);

  for (let i = 0; i < master_offer.snapshotLength && i < limit; i++) {
    const element = master_offer.snapshotItem(i);
    if (!element.hasAttribute("offer-updated")) {
      try {
        const title_element = getChildElementByXPath(element, xpath_offer_link)
        const price_element = getChildElementByXPath(element, xpath_price);
        const mileage_element = getChildElementByXPath(element, xpath_mileage);
        const age_element = getChildElementByXPath(element, xpath_age);

        const price_value = Number(price_element?.textContent.replace(/[^\d.-]/g, '') || -1);
        const year_value = Number(age_element?.textContent || -1);
        const mileage_value = Number(mileage_element?.textContent.replace(/\D/g, '') || -1);
        var car = Car.init(year_value, mileage_value, price_value);
        // var offer = Offer.init(car, title_element.getAttribute("href"), title_element.textContent);

        const reasonable = sanity.isReasonable(car);
        const monthlyCost = sanity.monthlyCost(car);
        const usableYears = sanity.usableYearsAvg(car);

        price_element.textContent = price_element.textContent + ` ${reasonable}, ${monthlyCost} PLN/msc@${usableYears}y`;
        element.setAttribute("offer-updated", "true");
        console.log(`Element for ${title_element.textContent} updated: it's price: ${price_value}, mileage: ${mileage_value}, year: ${year_value}`);
      } catch (error) {
        console.error(`Failed to update element: ${error}`);
      }
    }
  }
}

var buyersSanity = new Sanity();

function checkForNewElements() {
  browser.storage.local.get(["yearly_income", "max_income", "max_car_age", "yearly_mileage", "max_mileage"]).then((data_rozs) => {
    const { yearly_income,
      max_income,
      max_car_age,
      yearly_mileage,
      max_mileage } = data_rozs;

    buyersSanity = Sanity.init(yearly_income, max_income, max_car_age, yearly_mileage, max_mileage);
  });

  browser.storage.local.get(["limit", "xpath", "xpath_price", "xpath_mileage", "xpath_age", "xpath_offer_link"]).then((data) => {
    const { limit, xpath, xpath_price, xpath_mileage, xpath_age, xpath_offer_link } = data;
    modifyDOM(limit || 50, xpath, xpath_price, xpath_mileage, xpath_age, xpath_offer_link, buyersSanity);
  });
}

function getChildElementByXPath(parentElement, xpath) {
  try {
    const result = document.evaluate(xpath, parentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
      .singleNodeValue;

    if (result) {
      // The child element was found, do something with it.
      // console.trace(result.textContent);
      return result;
    } else {
      console.error(`Child element for XPath: ${xpath} not found.`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to get child element: ${error}`);
  }

  if (result) {
    // The child element was found, do something with it.
    // console.trace(result.textContent);
    return result;
  } else {
    console.error(`Child element for XPath: ${xpath} not found.`);
    return null;
  }
}

// Call the initial conversion on page load
checkForNewElements();

// Set an interval to periodically check for new elements to update
const checkInterval = 5000; // Check every 5 seconds
setInterval(checkForNewElements, checkInterval);