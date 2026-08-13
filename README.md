# Link Robins Mobile Logo

Puts your forum's logo in the navigation bar on phones, where visitors otherwise see only a menu button and no sign of whose forum they are on.

## What it does

- **Shows an image in the mobile navigation bar**, beside the menu and back buttons.
- **Uses an image you already have.** By default it uses your favicon, because a favicon is square and that is the shape a navigation bar has room for. You can point it at your forum logo instead, or at any image address.
- **Taps through to the homepage**, like the logo on desktop. You can turn that off and leave it as decoration.
- **Stays out of the way on desktop**, where the header already shows your logo.

## What it does NOT do

- **It does not replace your header logo.** This is only the phone navigation bar; everything else is untouched.
- **It does not resize or crop your image.** A wide wordmark will be scaled down to fit the height and can end up small. If that happens, use a square mark instead, which is what the favicon option is for.
- **It has no per-user setting.** What you choose is what every visitor sees.

## Settings

Admin, then Extensions, then Link Robins Mobile Logo.

| Setting | Default | What it does |
|---|---|---|
| Which image to show | Favicon | Favicon, your forum logo, or a custom image address. |
| Custom image address | empty | Only used when the setting above is a custom image. |
| Where the logo sits | Left of the buttons | Left or right of the menu and back buttons. Right leaves those buttons against the screen edge, which is a slightly easier thumb target. |
| Height in pixels | 32 | How tall the image sits in the bar. Between 16 and 64. |
| Tapping the logo goes to the homepage | on | Turn off to show the logo without making it a link. |

If the image you chose does not exist, nothing is shown rather than a broken image.

## Styling

Two classes to target from your custom Less in **Admin → Appearance**:

- `.LinkRobinsMobileLogo` wraps the image and is the link when linking is on.
- `.LinkRobinsMobileLogo-image` is the image itself.

The extension only shows it inside `@media @phone`, Flarum's own phone breakpoint, so it follows the same width Flarum uses everywhere else rather than a hardcoded pixel value.

## Requirements

- Flarum **2.0** or later
- PHP **8.3** or later

## Provenance

The idea comes from a CSS tweak posted by 010101 on the Flarum community forum: https://discuss.flarum.org/d/27333-add-logo-to-mobile-nav-bar

That tweak draws the logo with a `::after` pseudo-element on the navigation container. It still works on Flarum 2.0, and if all you want is a fixed image it remains a perfectly good five lines of CSS.

This extension exists for what a pseudo-element cannot do: it renders a real image, so the logo can be a link to your homepage, which was the most-asked question on that thread and had no answer; it carries alt text, so screen readers announce it; it reads the image from what your forum already has instead of a hardcoded address; and the size is a setting rather than three CSS values you tune by hand.

## Installation

```
composer require linkrobins/mobile-logo
php flarum extension:enable linkrobins-mobile-logo
```

Installing does not switch it on. Enabling does, and it then uses your favicon until you tell it otherwise.

## License

MIT
