import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';

// The global Flarum exposes, not an import: flarum-webpack-config does not
// externalize mithril, so importing it would bundle a second copy.
const m = window.m;

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
    return app.forum.attribute('linkrobinsMobileLogoCustomUrl') || null;
  }

  if (source === 'logo') {
    return app.forum.attribute('logoUrl') || app.forum.attribute('faviconUrl') || null;
  }

  return app.forum.attribute('faviconUrl') || app.forum.attribute('logoUrl') || null;
}

app.initializers.add('linkrobins/mobile-logo', () => {
  // extend, not override: Navigation's view returns a single element whose
  // children we add to, so mutating in place is exactly what extend is for.
  // (Returning a new vnode from an extend callback would be silently discarded.)
  extend('flarum/common/components/Navigation', 'view', function (vnode) {
    // Navigation is mounted in several places: the mobile back control, the
    // header, and the admin app. Only the mobile one carries App-backControl,
    // and that is the one this extension is about.
    const className = (this.attrs && this.attrs.className) || '';
    if (!String(className).includes('App-backControl')) return;

    const url = logoUrl();
    if (!url) return;

    if (!vnode || !vnode.children || typeof vnode.children.push !== 'function') return;

    const height = app.forum.attribute('linkrobinsMobileLogoHeight') || 32;

    const img = m('img', {
      className: 'LinkRobinsMobileLogo-image',
      src: url,
      alt: app.forum.attribute('title') || '',
      style: { height: height + 'px' },
    });

    const logo = app.forum.attribute('linkrobinsMobileLogoLinkHome')
      ? m(
          'a',
          {
            className: 'LinkRobinsMobileLogo',
            href: app.route('index'),
            // Let modifier-clicks and middle-clicks behave normally, the way
            // core's own home link does, so "open in new tab" still works.
            onclick: (e) => {
              if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
              e.preventDefault();
              m.route.set(app.route('index'));
            },
          },
          img
        )
      : m('span', { className: 'LinkRobinsMobileLogo' }, img);

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
