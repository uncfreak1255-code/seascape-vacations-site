"use strict";

const FEE_PASSAGE =
  "Seascape charges a share of your home's net rent, with a lower rate for homes that earn more. We quote your exact fee after looking at your home. That covers listing on Airbnb, Vrbo, Google, our direct website and more; setting and adjusting nightly rates as demand moves; screening and messaging guests from Bradenton; coordinating cleaning and maintenance, with a note before you have to ask; and paying you monthly with a statement of what your home earned and spent, with tourism and sales taxes remitted for you.";

function ownerHubBody({
  formName = '"owner-revenue-teardown"',
  whyTitle = "Why an eight-home operator",
  prefix = "",
  includeForm = true,
  extraMain = ""
} = {}) {
  const form = includeForm
    ? `<form name=${formName} method="POST"></form>
      <input type="checkbox" name="submitter_authority" value="owner_or_authorized_representative" required>
      I confirm I am the property owner or an authorized representative for this property.
      Owner statement, optional
      <label><span>How did you hear about us? (optional)</span>
        <select name="heard_about">
          <option value="chatgpt">ChatGPT</option>
        </select>
      </label>
      <label><span>What did you ask it? (optional)</span>
        <input type="text" name="heard_about_prompt" placeholder="e.g. best vacation rental manager in Bradenton">
      </label>`
    : "";
  return `${prefix}
    <main>
      <h2>Is Seascape a local alternative to Vacasa or Evolve?</h2>
      <p>Seascape Vacations is an owner-operated vacation rental manager</p>
      <a href="#owner-cta" data-placement="local-alternative">Request your 48-hour revenue review</a>
      <h1>Know what your home earned <em>and what needs attention.</em></h1>
      <p>Eight homes. One local team.</p>
      <p class="g-label">How our management fee works</p>
      <p>${FEE_PASSAGE}</p>
      <a href="#owner-cta">Get my review</a>
      ${form}
      <h2>What we do for your home</h2>
      <h2>${whyTitle}</h2>
      <h2>The homes we manage</h2>
      ${extraMain}
    </main>
  `;
}

module.exports = { FEE_PASSAGE, ownerHubBody };
