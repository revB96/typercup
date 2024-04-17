function printRegulationsRules() {  
    getRegulationsBySection("rules").then(async (rules) => {
      $(`#regulations-list-rules`).html("");
      rules.forEach(async (result, index) => {
        await $(`#regulations-list-rules`).append(`
        <li class="list-group-item ${result.color}">${result.content}</li>
        `);
      });
    });
}

function printRegulationsPoints() {  
    getRegulationsBySection("points").then(async (points) => {
      $(`#regulations-list-points`).html("");
      points.forEach(async (result, index) => {
        await $(`#regulations-list-points`).append(`
        <li class="list-group-item ${result.color}">${result.content}</li>
        `);
      });
    });
}

function printRegulationsAwards() {  
    getRegulationsBySection("awards").then(async (awards) => {
      $(`#regulations-list-awards`).html("");
      awards.forEach(async (result, index) => {
        await $(`#regulations-list-awards`).append(`
        <li class="list-group-item ${result.color}">${result.content}</li>
        `);
      });
    });
}

function printRegulationsSiteMap() {  
    getRegulationsBySection("site_map").then(async (site_map) => {
      $(`#regulations-list-site_map`).html("");
      site_map.forEach(async (result, index) => {
        await $(`#regulations-list-site_map`).append(`
        <li class="list-group-item ${result.color}">${result.content}</li>
        `);
      });
    });
}

$(document).ready(function () {
    if (window.location.pathname === '/rules') {
        printRegulationsRules()
        printRegulationsPoints()
        printRegulationsAwards()
        printRegulationsSiteMap()
    }
  });