
"use strict";

// Course details from the official Pawsitive Pet Academy scenario.
const COURSES = [
{id:'obedience',name:'Canine Obedience Training',price:1500,duration:'12 weeks',topics:'Basic commands, Leash training, Behaviour correction, Positive reinforcement, Socialisation techniques'},
{id:'grooming',name:'Pet Grooming',price:1500,duration:'12 weeks',topics:'Coat care, Bathing techniques, Nail trimming, Ear and eye cleaning, Grooming equipment'},
{id:'behaviour',name:'Animal Behaviour',price:1500,duration:'12 weeks',topics:'Animal psychology, Reading body language, Stress management, Behaviour modification, Enrichment activities'},
{id:'business',name:'Pet Business Management',price:1500,duration:'12 weeks',topics:'Customer service, Marketing, Business planning, Financial management, Legal requirements'},
{id:'puppy',name:'Puppy Care',price:750,duration:'6 weeks',topics:'Feeding, Vaccinations, Toilet training, Exercise, Socialisation'},
{id:'firstaid',name:'Pet First Aid',price:750,duration:'6 weeks',topics:'Minor injuries, CPR basics, Poison awareness, Heatstroke, Emergency transport'},
{id:'walking',name:'Basic Dog Walking',price:750,duration:'6 weeks',topics:'Walking equipment, Handling multiple dogs, Safety procedures, Exercise routines'}
];
const STORAGE_KEY = "pawsitiveSelectedCourses";
const REQUEST_KEY = "pawsitiveLastRequest";
const byId = (id) => document.getElementById(id);
const money = (value) => "R" + value.toFixed(2);
const escapeText = (text) => String(text).replace(/[&<>"']/g, (ch) =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));

function selectedIds() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (!Array.isArray(saved)) return [];
        return [...new Set(saved)].filter(id => COURSES.some(c => c.id === id));
    } catch (error) {
        return [];
    }
}
function saveIds(ids) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        return true;
    } catch (error) {
        showError("Unable to save your selection. Please enable browser storage.");
        return false;
    }
}
function selectedCourses() {
    return COURSES.filter(course => selectedIds().includes(course.id));
}
function calculation() {
    const courses = selectedCourses();
    const subtotal = courses.reduce((total, course) => total + course.price, 0);
    const count = courses.length;
    const rate = count >= 4 ? 0.15 : count === 3 ? 0.10 : count === 2 ? 0.05 : 0;
    const discount = subtotal * rate;
    return {courses, count, subtotal, rate, discount, total: subtotal - discount};
}
function showError(message) {
    const box = byId("page-error");
    if (box) {
        box.textContent = message;
        box.hidden = false;
        box.setAttribute("role", "alert");
    } else {
        alert(message);
    }
}
function clearError() {
    const box = byId("page-error");
    if (box) { box.hidden = true; box.textContent = ""; }
}
function requireSelection(nextPage) {
    if (!selectedIds().length) {
        showError("Please select at least one course before continuing.");
        return;
    }
    window.location.href = nextPage;
}
function initialiseSelection() {
    const list = byId("course-checkboxes");
    if (!list) return;
    const chosen = selectedIds();
    list.innerHTML = COURSES.map(course =>
        `<div class="selection-item"><input type="checkbox" id="${course.id}" value="${course.id}" ${chosen.includes(course.id) ? "checked" : ""}>
         <label for="${course.id}">${escapeText(course.name)} - ${money(course.price)}</label></div>`
    ).join("");
    list.addEventListener("change", () => {
        clearError();
        const ids = [...list.querySelectorAll('input:checked')].map(input => input.value);
        saveIds(ids);
        updateSelectionTotal();
    });
    updateSelectionTotal();
}
function updateSelectionTotal() {
    const summary = byId("selection-total");
    if (!summary) return;
    const calc = calculation();
    summary.textContent = `${calc.count} course(s) selected. Estimated total after discount: ${money(calc.total)}`;
}
function renderMySelection() {
    const target = byId("selected-course-list");
    if (!target) return;
    const chosen = selectedCourses();
    if (!chosen.length) {
        target.innerHTML = "<p>No courses selected yet. Please select a course first.</p>";
        return;
    }
    target.innerHTML = chosen.map(c =>
        `<div class="card"><h2>${escapeText(c.name)}</h2><p>Course fee: ${money(c.price)}</p></div>`
    ).join("");
}
function renderFees() {
    if (!byId("fee-summary")) return;
    const calc = calculation();
    if (!calc.count) {
        byId("fee-summary").innerHTML = "<p>No courses selected. Please choose at least one course.</p>";
        return;
    }
    byId("fee-summary").innerHTML =
        `<div class="summary-row"><span>Courses</span><span>${calc.count}</span></div>
         <div class="summary-row"><span>Subtotal</span><span>${money(calc.subtotal)}</span></div>
         <div class="summary-row"><span>Discount</span><span>${calc.rate * 100}%</span></div>
         <div class="summary-row"><span>Discount Amount</span><span>-${money(calc.discount)}</span></div>
         <div class="total-row"><span>Total</span><span>${money(calc.total)}</span></div>`;
    // VAT is intentionally not added: the scenario does not specify VAT treatment.
}
function renderDetails() {
    const target = byId("course-detail-content");
    if (!target) return;
    const id = new URLSearchParams(window.location.search).get("course") || "obedience";
    const course = COURSES.find(c => c.id === id);
    if (!course) {
        target.innerHTML = "<h1>Course not found</h1><p>Please choose a valid course.</p>";
        return;
    }
    target.innerHTML = `<div class="course-image">${escapeText(course.name)}</div>
        <h1>${escapeText(course.name)}</h1><p>Duration: ${escapeText(course.duration)}</p>
        <div class="card"><h2>Course Includes</h2><ul class="info-list">${course.topics.split(", ").map(t=>`<li>${escapeText(t)}</li>`).join("")}</ul></div>
        <div class="price">Course Fee: ${money(course.price)}</div>
        <button class="button" type="button" id="add-detail-course">Select Course</button>
        <a class="button gold" href="04-courses.html">Back to Courses</a>`;
    byId("add-detail-course").addEventListener("click", () => {
        const ids = selectedIds();
        if (!ids.includes(id)) ids.push(id);
        if (saveIds(ids)) window.location.href = "06-select-courses.html";
    });
}
function validateForm(form) {
    clearError();
    if (!form.checkValidity()) {
        form.reportValidity();
        showError("Please complete all required fields with valid information.");
        return false;
    }
    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');
    const phone = form.querySelector('[name="phone"]');
    const message = form.querySelector('[name="message"]');
    if (name && name.value.trim().length < 2) {
        showError("Please enter your full name (at least 2 characters)."); name.focus(); return false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        showError("Please enter a valid email address."); email.focus(); return false;
    }
    if (phone && !/^[0-9+\s()-]{9,20}$/.test(phone.value.trim())) {
        showError("Please enter a valid phone number."); phone.focus(); return false;
    }
    if (message && message.value.trim().length < 10) {
        showError("Please enter a message of at least 10 characters."); message.focus(); return false;
    }
    return true;
}
function setupForms() {
    document.querySelectorAll("form[data-form-type]").forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();
            if (!validateForm(form)) return;
            const type = form.dataset.formType;
            if (type === "quote" && !selectedIds().length) {
                showError("Select at least one course before requesting a quote.");
                return;
            }
            const details = Object.fromEntries(new FormData(form).entries());
            const record = {type, details, date: new Date().toISOString(),
                ...(type === "quote" ? {fees: calculation()} : {})};
            try {
                // This is a front-end demonstration. It does NOT send information to the academy.
                sessionStorage.setItem(REQUEST_KEY, JSON.stringify(record));
                window.location.href = "12-confirmation.html";
            } catch (error) {
                showError("Your browser could not save the form. Please try again.");
            }
        });
    });
}
function renderConfirmation() {
    const target = byId("confirmation-message");
    if (!target) return;
    let record;
    try { record = JSON.parse(sessionStorage.getItem(REQUEST_KEY) || "null"); }
    catch (error) { record = null; }
    if (!record) {
        target.textContent = "No completed request was found. Please complete an enquiry or quote form first.";
        return;
    }
    target.textContent = record.type === "quote"
        ? `Your quote request has been saved in this browser for demonstration. Estimated total: ${money(record.fees.total)}. It has not been sent to the academy.`
        : "Your enquiry has been saved in this browser for demonstration. It has not been sent to the academy.";
}
document.addEventListener("DOMContentLoaded", () => {
    initialiseSelection();
    renderMySelection();
    renderFees();
    renderDetails();
    setupForms();
    renderConfirmation();
    document.querySelectorAll("[data-next-selection]").forEach(button => {
        button.addEventListener("click", () => requireSelection(button.dataset.nextSelection));
    });
});
