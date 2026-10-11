<?php

/*
 * This file is part of linkrobins/mobile-logo.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace LinkRobins\MobileLogo\Tests\integration;

use Flarum\Testing\integration\TestCase;
use PHPUnit\Framework\Attributes\Test;

/**
 * The extension is front-end only; its PHP side is the settings it sends to the browser and the assets the
 * forum compiles. These run weekly against the newest Flarum 2.x, so a core
 * change that breaks either fails here first.
 */
class ForumTest extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();

        $this->extension('linkrobins-mobile-logo');
    }

    /** @return array<string, mixed> */
    private function forumAttributes(): array
    {
        $response = $this->send($this->request('GET', '/api'));
        $this->assertEquals(200, $response->getStatusCode());

        return json_decode($response->getBody()->getContents(), true)['data']['attributes'];
    }

    #[Test]
    public function the_forum_page_loads_with_the_extension_enabled(): void
    {
        // Rendering the forum compiles the extension's JS and LESS into the
        // forum assets; a stylesheet that does not compile fails the page.
        $response = $this->send($this->request('GET', '/'));

        $this->assertEquals(200, $response->getStatusCode());
    }

    #[Test]
    public function the_defaults_reach_the_forum(): void
    {
        $a = $this->forumAttributes();

        $this->assertSame('favicon', $a['linkrobinsMobileLogoSource']);
        $this->assertSame('', $a['linkrobinsMobileLogoCustomUrl']);
        $this->assertSame('left', $a['linkrobinsMobileLogoPosition']);
        $this->assertSame(32, $a['linkrobinsMobileLogoHeight']);
        $this->assertTrue($a['linkrobinsMobileLogoLinkHome']);
    }

    #[Test]
    public function the_height_is_sent_as_a_number_and_the_link_as_a_boolean(): void
    {
        $this->setting('linkrobins-mobile-logo.height', '48');
        $this->setting('linkrobins-mobile-logo.link_home', '0');

        $a = $this->forumAttributes();
        $this->assertSame(48, $a['linkrobinsMobileLogoHeight']);
        $this->assertFalse($a['linkrobinsMobileLogoLinkHome']);
    }
}
