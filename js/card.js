/* Digital business cards — bridgewayaerotech.com/card/<slug>
 *
 * Replaces the hosted qrco.de card with one served from our own domain, so
 * the URL on a printed card carries the company name and the traffic is ours.
 *
 * Each card page is a thin stub that sets window.CARD_ID and loads this file,
 * so the person data and all the behaviour live in one place rather than
 * being copied three times.
 *
 * Contact details here are the ones already published on the team section of
 * the home page. Nothing private is added.
 */
(function () {
  'use strict';

  var PEOPLE = {
    'brian-dillion': {
      first: 'Brian', last: 'Dillion', middle: 'R.',
      name: 'Brian R. Dillion',
      title: 'Founder & CEO',
      email: 'BrianDillion@BridgewayAeroTech.com',
      phone: '+1 415-819-8953',
      photo: '../assets/images/team/brian-dillion-2026.jpg',
      linkedin: ''   // add the profile URL and the button appears
    },
    'jerome-basile': {
      first: 'Jerome', last: 'Basile', middle: '',
      name: 'Jerome Basile',
      title: 'VP Technical Operations',
      email: 'jbasile@bridgewayaerotech.com',
      phone: '+1 941-212-8060',
      photo: '../assets/images/team/jerome-basile.jpg',
      linkedin: ''
    },
    'shannon-poulsen': {
      first: 'Shannon', last: 'Poulsen', middle: '',
      name: 'Shannon Poulsen, PhD',
      title: 'Insights & Marketing Consultant',
      email: 'info@BridgewayAeroTech.com',
      phone: '',
      photo: '../assets/images/team/shannon-poulsen.jpg',
      linkedin: ''
    }
  };

  var ORG = 'Bridgeway Aero Tech';
  var SITE = 'https://bridgewayaerotech.com';

  var person = PEOPLE[window.CARD_ID];
  var root = document.getElementById('cardRoot');
  if (!person || !root) {
    if (root) root.innerHTML = '<p class="card-missing">Card not found.</p>';
    return;
  }

  document.title = person.name + ' | ' + ORG;

  /* Phone numbers are displayed with spacing and dialled without it. */
  function telHref(p) { return 'tel:' + p.replace(/[^\d+]/g, ''); }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function row(label, value, href, external) {
    var wrap = el('div', 'card-row');
    var body = el('div', 'card-row-body');
    if (href) {
      var a = el('a', 'card-row-value', value);
      a.href = href;
      if (external) { a.target = '_blank'; a.rel = 'noopener'; }
      body.appendChild(a);
    } else {
      body.appendChild(el('p', 'card-row-value', value));
    }
    body.appendChild(el('p', 'card-row-label', label));
    wrap.appendChild(body);
    return wrap;
  }

  /* vCard 3.0. Kept deliberately plain: no embedded photo, because base64
     image data pushes the file into the hundreds of kilobytes and some phone
     address books reject it outright. */
  function vcard(p) {
    var lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:' + p.last + ';' + p.first + ';' + (p.middle || '') + ';;',
      'FN:' + p.name,
      'ORG:' + ORG,
      'TITLE:' + p.title
    ];
    if (p.phone) lines.push('TEL;TYPE=CELL:' + p.phone.replace(/[^\d+]/g, ''));
    lines.push('EMAIL;TYPE=WORK:' + p.email);
    lines.push('URL:' + SITE);
    if (p.linkedin) lines.push('URL;TYPE=LinkedIn:' + p.linkedin);
    lines.push('END:VCARD');
    return lines.join('\r\n') + '\r\n';
  }

  function downloadVcard() {
    var blob = new Blob([vcard(person)], { type: 'text/vcard;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = window.CARD_ID + '.vcf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke on the next tick; revoking synchronously can cancel the download
    // before the browser has read the blob.
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function sharePage(btn) {
    var data = { title: person.name + ' — ' + ORG, text: person.name + ', ' + person.title, url: location.href };
    if (navigator.share) {
      navigator.share(data).catch(function () { /* user dismissed */ });
      return;
    }
    // No Web Share API (most desktop browsers): copy the URL instead and say so.
    var done = function () {
      var was = btn.textContent;
      btn.textContent = 'Link copied';
      setTimeout(function () { btn.textContent = was; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(location.href).then(done, function () { window.prompt('Copy this link:', location.href); });
    } else {
      window.prompt('Copy this link:', location.href);
    }
  }

  // ── build ──
  var head = el('div', 'card-head');
  var img = document.createElement('img');
  img.className = 'card-photo';
  img.src = person.photo;
  img.alt = person.name + ' — ' + person.title;
  head.appendChild(img);
  head.appendChild(el('h1', 'card-name', person.name));
  head.appendChild(el('p', 'card-title', person.title));

  var actions = el('div', 'card-actions');
  if (person.phone) {
    var call = el('a', 'card-action', 'Call');
    call.href = telHref(person.phone);
    actions.appendChild(call);
  }
  var mail = el('a', 'card-action', 'Email');
  mail.href = 'mailto:' + person.email;
  actions.appendChild(mail);

  var rows = el('div', 'card-rows');
  if (person.phone) rows.appendChild(row('Mobile', person.phone, telHref(person.phone)));
  rows.appendChild(row('Email', person.email, 'mailto:' + person.email));
  rows.appendChild(row('Company', ORG, '../index.html'));
  rows.appendChild(row('Website', 'bridgewayaerotech.com', SITE, true));
  if (person.linkedin) rows.appendChild(row('LinkedIn', 'View profile', person.linkedin, true));

  var save = el('button', 'card-btn card-btn-primary', 'Download vCard');
  save.type = 'button';
  save.addEventListener('click', downloadVcard);

  var share = el('button', 'card-btn card-btn-ghost', 'Share this page');
  share.type = 'button';
  share.addEventListener('click', function () { sharePage(share); });

  var foot = el('div', 'card-foot');
  foot.appendChild(save);
  foot.appendChild(share);

  root.textContent = '';
  root.appendChild(head);
  root.appendChild(actions);
  root.appendChild(rows);
  root.appendChild(foot);
})();
