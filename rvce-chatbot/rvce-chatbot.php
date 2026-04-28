<?php
/**
 * Plugin Name: RVCE Chatbot
 * Plugin URI: 
 * Description: Interactive AI chatbot for RV College of Engineering (RVCE).
 * Version: 2.0.0
 * Author: Hemanth BV
 * Text Domain: rvce-chatbot
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

// ====== Activation Hook: Create Database Table ======
function rvce_chatbot_activate() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'rvce_chat_logs';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        query text NOT NULL,
        intent_id varchar(100) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    dbDelta( $sql );
}
register_activation_hook( __FILE__, 'rvce_chatbot_activate' );

// ====== Proper Asset Enqueueing ======
function rvce_chatbot_enqueue_assets() {
    $plugin_url = plugin_dir_url( __FILE__ );
    $version = filemtime( plugin_dir_path( __FILE__ ) . 'assets/script.js' );

    // Google Fonts — loaded in <head> properly
    wp_enqueue_style(
        'rvce-chatbot-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
        array(),
        null
    );

    // Plugin CSS
    wp_enqueue_style(
        'rvce-chatbot-style',
        $plugin_url . 'assets/style.css',
        array('rvce-chatbot-fonts'),
        $version
    );

    // Plugin JS — loaded in footer
    wp_enqueue_script(
        'rvce-chatbot-script',
        $plugin_url . 'assets/script.js',
        array(), // no dependencies
        $version,
        true // load in footer
    );

    // Pass AJAX URL to script
    wp_localize_script( 'rvce-chatbot-script', 'rvceChatbotAjax', array(
        'ajaxUrl' => admin_url( 'admin-ajax.php' )
    ));
}
add_action( 'wp_enqueue_scripts', 'rvce_chatbot_enqueue_assets' );

// ====== AJAX Endpoint: Log Chat Queries ======
function rvce_log_chat_query() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'rvce_chat_logs';

    $query = isset($_POST['query']) ? sanitize_text_field($_POST['query']) : '';
    $intent_id = isset($_POST['intent_id']) ? sanitize_text_field($_POST['intent_id']) : '';

    if (!empty($query)) {
        $wpdb->insert(
            $table_name,
            array(
                'query' => $query,
                'intent_id' => $intent_id,
                'created_at' => current_time('mysql')
            )
        );
    }
    wp_send_json_success();
}
add_action('wp_ajax_rvce_log_chat', 'rvce_log_chat_query');
add_action('wp_ajax_nopriv_rvce_log_chat', 'rvce_log_chat_query');

// ====== Admin Dashboard Menu ======
function rvce_chatbot_admin_menu() {
    add_menu_page(
        'Chatbot Analytics',
        'RVCE Chatbot',
        'manage_options',
        'rvce-chatbot-analytics',
        'rvce_chatbot_analytics_page',
        'dashicons-chart-pie',
        30
    );
}
add_action('admin_menu', 'rvce_chatbot_admin_menu');

function rvce_chatbot_analytics_page() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'rvce_chat_logs';

    // Metrics
    $total_queries = $wpdb->get_var("SELECT COUNT(*) FROM $table_name");
    $today_queries = $wpdb->get_var("SELECT COUNT(*) FROM $table_name WHERE DATE(created_at) = CURDATE()");
    
    // Top Intents
    $top_intents = $wpdb->get_results("SELECT intent_id, COUNT(*) as count FROM $table_name WHERE intent_id != 'unmatched' GROUP BY intent_id ORDER BY count DESC LIMIT 5");

    // Missed Queries
    $missed_queries = $wpdb->get_results("SELECT query, created_at FROM $table_name WHERE intent_id = 'unmatched' ORDER BY created_at DESC LIMIT 10");

    // Recent Queries
    $recent_queries = $wpdb->get_results("SELECT query, intent_id, created_at FROM $table_name ORDER BY created_at DESC LIMIT 10");

    echo '<div class="wrap" style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;">';
    echo '<h1>RVCE Chatbot Analytics Dashboard</h1>';
    
    echo '<div style="display: flex; gap: 20px; margin-top: 20px; flex-wrap: wrap;">';
    
    // Summary Cards
    echo '<div style="flex: 1; min-width: 300px; background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">';
    echo '<h3 style="margin-top:0; color:#475569;">Overview</h3>';
    echo '<p style="font-size: 36px; font-weight: bold; margin: 10px 0; color:#1e293b;">' . intval($total_queries) . ' <span style="font-size:14px; font-weight:normal; color:#64748b;">Total Queries</span></p>';
    echo '<p style="font-size: 16px; color: #10b981; font-weight: 500; margin:0;">&uarr; ' . intval($today_queries) . ' today</p>';
    echo '</div>';

    // Top Intents
    echo '<div style="flex: 2; min-width: 300px; background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">';
    echo '<h3 style="margin-top:0; color:#475569;">Top Topics (Intents)</h3>';
    if ($top_intents) {
        echo '<ul style="margin:0; padding:0; list-style:none;">';
        foreach($top_intents as $intent) {
            echo '<li style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f1f5f9;"><strong>' . esc_html($intent->intent_id) . '</strong> <span style="background:#e2e8f0; padding:2px 8px; border-radius:12px; font-size:12px; font-weight:bold;">' . intval($intent->count) . '</span></li>';
        }
        echo '</ul>';
    } else {
        echo '<p style="color:#64748b;">Not enough data yet.</p>';
    }
    echo '</div>';

    echo '</div>'; // End flex

    echo '<div style="display: flex; gap: 20px; margin-top: 20px; flex-wrap: wrap;">';

    // Missed Queries
    echo '<div style="flex: 1; min-width: 300px; background: #fff; border-left: 4px solid #ef4444; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">';
    echo '<h3 style="margin-top:0; color:#ef4444;">Missed Queries (Unanswered)</h3>';
    echo '<p style="color:#64748b; font-size:13px;">Add these topics to the bot to improve it.</p>';
    if ($missed_queries) {
        echo '<ul style="margin:0; padding:0; list-style:none;">';
        foreach($missed_queries as $miss) {
            echo '<li style="padding:8px 0; border-bottom:1px solid #f1f5f9;">"' . esc_html($miss->query) . '" <div style="color:#94a3b8; font-size:11px; margin-top:4px;">' . date('M j, Y g:i a', strtotime($miss->created_at)) . '</div></li>';
        }
        echo '</ul>';
    } else {
        echo '<p style="color:#10b981; font-weight:500;">No missed queries! The bot is answering everything perfectly.</p>';
    }
    echo '</div>';

    // Recent Queries
    echo '<div style="flex: 1; min-width: 300px; background: #fff; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">';
    echo '<h3 style="margin-top:0; color:#475569;">Recent Interactions</h3>';
    if ($recent_queries) {
        echo '<ul style="margin:0; padding:0; list-style:none;">';
        foreach($recent_queries as $recent) {
            echo '<li style="padding:8px 0; border-bottom:1px solid #f1f5f9;">"' . esc_html($recent->query) . '" <div style="margin-top:4px;"><span style="color:#8b5cf6; font-size:12px; font-weight:bold; background:#ede9fe; padding:2px 6px; border-radius:4px;">&rarr; ' . esc_html($recent->intent_id) . '</span></div></li>';
        }
        echo '</ul>';
    } else {
        echo '<p style="color:#64748b;">No recent queries.</p>';
    }
    echo '</div>';

    echo '</div>'; // End flex

    echo '</div>';
}

// ====== Inject Chatbot HTML into Footer ======
function rvce_chatbot_inject_html() {
    ?>
    <!-- RVCE Chatbot Widget — Isolated Container -->
    <div id="rvce-chatbot-root" class="rvce-chatbot-widget">
        <canvas id="particles"></canvas>

        <div class="app-container">
            <!-- Floating Chat Widget Button -->
            <button class="chat-fab" id="chatFab" title="Chat with RVCE Assistant">
                <span class="fab-icon open-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                </span>
                <span class="fab-icon close-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </span>
                <span class="fab-badge" id="fabBadge">1</span>
            </button>

            <!-- Chat Window -->
            <div class="chat-window" id="chatWindow">
                <!-- Header -->
                <div class="chat-header">
                    <div class="header-left">
                        <div class="avatar-container">
                            <div class="avatar">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                    <path d="M2 17l10 5 10-5"/>
                                    <path d="M2 12l10 5 10-5"/>
                                </svg>
                            </div>
                            <div class="avatar-ring"></div>
                        </div>
                        <div class="header-info">
                            <h1>RVCE Assistant</h1>
                            <div class="status-row">
                                <span class="status-dot"></span>
                                <span class="status-text">Online — Ready to help</span>
                            </div>
                        </div>
                    </div>
                    <div class="header-actions" style="display: flex; align-items: center; gap: 10px;">
                        <button class="clear-btn" id="clearBtn" title="Clear Chat">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            </svg>
                        </button>
                        <div class="tone-switch" id="toneSwitch" title="Toggle tone">
                            <div class="tone-track">
                                <span class="tone-emoji funny-emoji">😄</span>
                                <span class="tone-emoji pro-emoji">🎓</span>
                                <div class="tone-thumb" id="toneThumb"></div>
                            </div>
                            <span class="tone-current-label" id="toneLabel">Buddy</span>
                        </div>
                    </div>
                </div>

                <!-- Quick Stats Bar -->
                <div class="stats-bar">
                    <div class="stat-chip">
                        <span class="stat-icon">🏆</span>
                        <span>NAAC A+</span>
                    </div>
                    <div class="stat-chip">
                        <span class="stat-icon">📊</span>
                        <span>NIRF 101-150</span>
                    </div>
                    <div class="stat-chip">
                        <span class="stat-icon">💰</span>
                        <span>Avg 9.18 LPA</span>
                    </div>
                    <div class="stat-chip">
                        <span class="stat-icon">🎓</span>
                        <span>Est. 1963</span>
                    </div>
                </div>

                <!-- Chat Messages -->
                <div class="chat-messages" id="chatMessages">
                    <!-- Messages injected here -->
                </div>

                <!-- Typing Indicator -->
                <div class="typing-indicator" id="typingIndicator">
                    <div class="typing-bubble">
                        <div class="typing-av">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                        </div>
                        <div class="typing-dots"><span></span><span></span><span></span></div>
                    </div>
                </div>

                <!-- Quick Suggestions -->
                <div class="quick-suggestions" id="quickSuggestions">
                    <button class="suggestion-chip" data-query="What are the placements like?">💼 Placements</button>
                    <button class="suggestion-chip" data-query="How to get admission?">🎓 Admissions</button>
                    <button class="suggestion-chip" data-query="hostels">🏠 Hostels</button>
                    <button class="suggestion-chip" data-query="departments">📚 Departments</button>
                    <button class="suggestion-chip" data-query="campus life">🏕️ Campus</button>
                    <button class="suggestion-chip" data-query="contact">📞 Contact</button>
                </div>

                <!-- Input Area -->
                <div class="chat-input-area">
                    <div class="input-wrapper">
                        <button id="emojiBtn" class="emoji-btn" title="Main Menu">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                                <line x1="9" y1="9" x2="9.01" y2="9"/>
                                <line x1="15" y1="9" x2="15.01" y2="9"/>
                            </svg>
                        </button>
                        <button id="micBtn" class="mic-btn" title="Voice Search">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                                <line x1="12" y1="19" x2="12" y2="23"/>
                                <line x1="8" y1="23" x2="16" y2="23"/>
                            </svg>
                        </button>
                        <input type="text" id="userInput" placeholder="Ask me anything about RVCE..." autocomplete="off">
                        <button id="sendBtn" class="send-btn" title="Send">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php
}
add_action( 'wp_footer', 'rvce_chatbot_inject_html', 999 );
