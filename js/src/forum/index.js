import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import Navigation from 'flarum/common/components/Navigation';

// The global Flarum exposes, not an import: flarum-webpack-config does not
// externalize mithril, so importing it would bundle a second copy.
const m = window.m;

// The admin field offers 16 to 64. These re-apply that range at render time,
// because the stored setting is not clamped and a value edited straight into
// the database would otherwise reach the stylesheet.
const MIN_HEIGHT = 16;
const MAX_HEIGHT = 64;
const DEFAULT_HEIGHT = 32;

/**
 * Vet an admin-supplied image address.
 *
 * Not an XSS defence: an <img src> does not execute a javascript: or data:
 * URL, and Mithril escapes the attribute anyway. This is about the two ways a
 * well-meant address silently produces no logo at all:
 *
 *  - a plain http:// image on an https:// forum is blocked as mixed content
 *  - anything that is not http(s) is not an image the browser will fetch
 *
 * Refusing here means the logo is absent for a reason the admin can be told
 * about, rather than absent with an error buried in the browser console.
 */
function vetUrl(raw) {
  const value = String(raw || '').trim();

  if (!value) return null;

  // A relative path is same-origin by definition, which is the case we want to
  // encourage: no third party sees your visitors.
  if (value.startsWith('/')) return value;

  try {
    const parsed = new URL(value, window.location.href);

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    if (window.location.protocol === 'https:' && parsed.protocol === 'http:') return null;

    return parsed.href;
  } catch (e) {
    return null;
  }
}

/**
 * How tall to draw it, clamped to the range the admin field offers.
 */
function logoHeight() {
  const raw = parseInt(app.forum.attribute('linkrobinsMobileLogoHeight'), 10);

  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_HEIGHT;

  return Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, raw));
}

/**
 * Which image to show, resolved from settings against what the forum already has.
 *
 * Returns null when there is nothing sensible to show, which is the whole
 * behaviour when a forum has no favicon and no logo: render nothing rather than
 * a broken image.
 */
function logoUrl() {
  const source = app.forum.attribute('linkrobinsMobileLogoSource') || 'favicon';

  if (source === 'custom') {
    // Only the custom address is vetted. The favicon and logo addresses come
    // from Flarum itself and are already same-origin.
    return vetUrl(app.forum.attribute('linkrobinsMobileLogoCustomUrl'));
  }

  if (source === 'logo') {
    return app.forum.attribute('logoUrl') || app.forum.attribute('faviconUrl') || null;
  }

  return app.forum.attribute('faviconUrl') || app.forum.attribute('logoUrl') || null;
}

/**
 * The logo element, or null when there is nothing sensible to show.
 */
function buildLogo() {
  const url = logoUrl();
  if (!url) return null;

  const height = logoHeight();

  const img = m('img', {
    className: 'LinkRobinsMobileLogo-image',
    src: url,
    alt: app.forum.attribute('title') || '',
    style: { height: height + 'px' },
    // Vetting the address catches a bad scheme, but not a typo, a deleted
    // file or a host that is simply down: those still resolve and then fail
    // to load, leaving a broken-image icon in the navigation bar. Hide the
    // whole thing when the image does not arrive, so a mistake costs an
    // absent logo rather than a visible defect on every page.
    onerror: (e) => {
      const wrapper = e.target && e.target.parentNode;

      if (wrapper && wrapper.style) wrapper.style.display = 'none';
    },
  });

  const logo = app.forum.attribute('linkrobinsMobileLogoLinkHome')
    ? m(
        'a',
        {
          className: 'LinkRobinsMobileLogo',
          // The forum's base URL, and history.home() to navigate: exactly
          // what core's own home-link does. Both resolve to '/', which Flarum
          // maps to whatever the admin set as the default route.
          //
          // NOT app.route('index'): that is the discussion index specifically
          // (/all), so on a forum with a custom homepage the logo went to the
          // wrong place. Reported by Xkyer on discuss d/39682.
          href: app.forum.attribute('baseUrl') || '/',
          // Let modifier-clicks and middle-clicks behave normally, the way
          // core's own home link does, so "open in new tab" still works.
          onclick: (e) => {
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
            e.preventDefault();

            if (app.history && typeof app.history.home === 'function') {
              app.history.home();
            } else {
              m.route.set('/');
            }
          },
        },
        img
      )
    : m('span', { className: 'LinkRobinsMobileLogo' }, img);

  return logo;
}

/**
 * Only the mobile control strip carries App-backControl. Navigation is also
 * mounted in the desktop header and the admin app, which this is not about.
 */
function isMobileStrip(component) {
  const className = (component.attrs && component.attrs.className) || '';

  return String(className).includes('App-backControl');
}

// Where the logo sits among core's controls. Core's strip is an ItemList
// (drawer 100, back 90, pane 80; higher comes first), so left means above
// all of them and right means below all of them.
const PRIORITY_LEFT = 110;
const PRIORITY_RIGHT = -10;

app.initializers.add('linkrobins/mobile-logo', () => {
  // Flarum 2.0.0 builds the strip from Navigation.items(), so the logo joins
  // it as an item with an explicit position next to core's buttons.
  if (typeof Navigation.prototype.items === 'function') {
    extend('flarum/common/components/Navigation', 'items', function (items) {
      if (!isMobileStrip(this)) return;

      const logo = buildLogo();
      if (!logo) return;

      const right = app.forum.attribute('linkrobinsMobileLogoPosition') === 'right';

      items.add('linkrobins-mobile-logo', logo, right ? PRIORITY_RIGHT : PRIORITY_LEFT);
    });

    return;
  }

  // Older 2.0 betas and release candidates have no items(): add to the
  // rendered children instead. extend, not override: mutating the vnode in
  // place is what extend is for (a returned vnode would be discarded).
  extend('flarum/common/components/Navigation', 'view', function (vnode) {
    if (!isMobileStrip(this)) return;
    if (!vnode || !vnode.children || typeof vnode.children.push !== 'function') return;

    const logo = buildLogo();
    if (!logo) return;

    // Left of the existing controls by default, so the logo is the first thing
    // read on the bar. Putting it right keeps core's buttons at the very edge,
    // which is the larger hit area, so both are offered.
    if (app.forum.attribute('linkrobinsMobileLogoPosition') === 'right') {
      vnode.children.push(logo);
    } else {
      vnode.children.unshift(logo);
    }
  });
});
