<?php
/**
 * Widget Elementor Pro pour les Médias SIPORTS
 * Affiche les contenus média (webinaires, podcasts, capsules, etc.)
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Vérifier si Elementor est disponible
if (!class_exists('\Elementor\Widget_Base')) {
    return;
}

class Elementor_SIPORTS_Media_Widget extends \Elementor\Widget_Base {

    /**
     * Get widget name
     */
    public function get_name() {
        return 'siports_media';
    }

    /**
     * Get widget title
     */
    public function get_title() {
        return __('SIPORTS Média', 'siports-articles-shortcode');
    }

    /**
     * Get widget icon
     */
    public function get_icon() {
        return 'eicon-video-playlist';
    }

    /**
     * Get widget categories
     */
    public function get_categories() {
        return ['general'];
    }

    /**
     * Get widget keywords
     */
    public function get_keywords() {
        return ['siports', 'media', 'video', 'podcast', 'webinar', 'audio'];
    }

    /**
     * Register widget controls
     */
    protected function register_controls() {
        
        // =============================
        // SECTION CONTENU
        // =============================
        $this->start_controls_section(
            'content_section',
            [
                'label' => __('Contenu Média', 'siports-articles-shortcode'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'media_id',
            [
                'label' => __('ID du Média', 'siports-articles-shortcode'),
                'type' => \Elementor\Controls_Manager::TEXT,
                'placeholder' => __('ex: 550e8400-e29b-41d4-a716-446655440000', 'siports-articles-shortcode'),
                'description' => __('Copiez l\'ID depuis le tableau de bord Marketing', 'siports-articles-shortcode'),
            ]
        );

        $this->add_control(
            'layout',
            [
                'label' => __('Layout', 'siports-articles-shortcode'),
                'type' => \Elementor\Controls_Manager::SELECT,
                'default' => 'full',
                'options' => [
                    'full' => __('Pleine largeur', 'siports-articles-shortcode'),
                    'compact' => __('Compact', 'siports-articles-shortcode'),
                    'minimal' => __('Minimal', 'siports-articles-shortcode'),
                ],
            ]
        );

        $this->end_controls_section();

        // =============================
        // SECTION OPTIONS D'AFFICHAGE
        // =============================
        $this->start_controls_section(
            'display_section',
            [
                'label' => __('Options d\'affichage', 'siports-articles-shortcode'),
                'tab' => \Elementor\Controls_Manager::TAB_CONTENT,
            ]
        );

        $this->add_control(
            'show_thumbnail',
            [
                'label' => __('Afficher la vignette', 'siports-articles-shortcode'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => __('Oui', 'siports-articles-shortcode'),
                'label_off' => __('Non', 'siports-articles-shortcode'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'show_description',
            [
                'label' => __('Afficher la description', 'siports-articles-shortcode'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => __('Oui', 'siports-articles-shortcode'),
                'label_off' => __('Non', 'siports-articles-shortcode'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'show_tags',
            [
                'label' => __('Afficher les tags', 'siports-articles-shortcode'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => __('Oui', 'siports-articles-shortcode'),
                'label_off' => __('Non', 'siports-articles-shortcode'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'show_stats',
            [
                'label' => __('Afficher les statistiques', 'siports-articles-shortcode'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => __('Oui', 'siports-articles-shortcode'),
                'label_off' => __('Non', 'siports-articles-shortcode'),
                'return_value' => 'yes',
                'default' => 'yes',
            ]
        );

        $this->add_control(
            'autoplay',
            [
                'label' => __('Lecture automatique', 'siports-articles-shortcode'),
                'type' => \Elementor\Controls_Manager::SWITCHER,
                'label_on' => __('Oui', 'siports-articles-shortcode'),
                'label_off' => __('Non', 'siports-articles-shortcode'),
                'return_value' => 'yes',
                'default' => 'no',
                'description' => __('Démarre automatiquement le média', 'siports-articles-shortcode'),
            ]
        );

        $this->end_controls_section();

        // =============================
        // SECTION STYLE
        // =============================
        $this->start_controls_section(
            'style_section',
            [
                'label' => __('Style', 'siports-articles-shortcode'),
                'tab' => \Elementor\Controls_Manager::TAB_STYLE,
            ]
        );

        $this->add_control(
            'title_color',
            [
                'label' => __('Couleur du titre', 'siports-articles-shortcode'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .siports-media-title' => 'color: {{VALUE}}',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Typography::get_type(),
            [
                'name' => 'title_typography',
                'label' => __('Typographie du titre', 'siports-articles-shortcode'),
                'selector' => '{{WRAPPER}} .siports-media-title',
            ]
        );

        $this->add_control(
            'description_color',
            [
                'label' => __('Couleur de la description', 'siports-articles-shortcode'),
                'type' => \Elementor\Controls_Manager::COLOR,
                'selectors' => [
                    '{{WRAPPER}} .siports-media-description' => 'color: {{VALUE}}',
                ],
            ]
        );

        $this->add_control(
            'border_radius',
            [
                'label' => __('Rayon de bordure', 'siports-articles-shortcode'),
                'type' => \Elementor\Controls_Manager::SLIDER,
                'size_units' => ['px'],
                'range' => [
                    'px' => [
                        'min' => 0,
                        'max' => 50,
                        'step' => 1,
                    ],
                ],
                'default' => [
                    'size' => 12,
                ],
                'selectors' => [
                    '{{WRAPPER}} .siports-media' => 'border-radius: {{SIZE}}{{UNIT}};',
                ],
            ]
        );

        $this->add_group_control(
            \Elementor\Group_Control_Box_Shadow::get_type(),
            [
                'name' => 'box_shadow',
                'label' => __('Ombre', 'siports-articles-shortcode'),
                'selector' => '{{WRAPPER}} .siports-media',
            ]
        );

        $this->end_controls_section();
    }

    /**
     * Render widget output on the frontend
     */
    protected function render() {
        $settings = $this->get_settings_for_display();
        
        // Construire les attributs du shortcode
        $shortcode_atts = [
            'id' => $settings['media_id'],
            'layout' => $settings['layout'],
            'show_thumbnail' => $settings['show_thumbnail'],
            'show_description' => $settings['show_description'],
            'show_tags' => $settings['show_tags'],
            'show_stats' => $settings['show_stats'],
            'autoplay' => $settings['autoplay'],
        ];
        
        // Créer la chaîne d'attributs
        $atts_string = '';
        foreach ($shortcode_atts as $key => $value) {
            if (!empty($value)) {
                $atts_string .= sprintf(' %s="%s"', $key, esc_attr($value));
            }
        }
        
        // Afficher le shortcode
        echo do_shortcode('[siports_media' . $atts_string . ']');
    }

    /**
     * Render widget output in the Elementor editor
     */
    protected function content_template() {
        ?>
        <#
        var mediaId = settings.media_id || '';
        var layout = settings.layout || 'full';
        #>
        
        <div class="siports-media siports-media-{{ layout }}">
            <div class="siports-media-thumbnail">
                <div style="width: 100%; height: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: 600;">
                    <# if (mediaId) { #>
                        🎥 Prévisualisation du média
                    <# } else { #>
                        ⚠️ Veuillez saisir un ID de média
                    <# } #>
                </div>
                <div class="siports-media-type-badge" style="position: absolute; top: 15px; left: 15px; background: rgba(0,0,0,0.8); color: white; padding: 8px 15px; border-radius: 20px;">
                    📺 Média SIPORTS
                </div>
            </div>
            
            <div class="siports-media-content">
                <div class="siports-media-badges">
                    <span class="siports-badge siports-badge-published" style="background: #10b981; color: white; padding: 6px 14px; border-radius: 20px; font-size: 13px;">
                        ✅ Publié
                    </span>
                </div>
                
                <h2 class="siports-media-title" style="font-size: 28px; font-weight: 700; margin-bottom: 15px;">
                    <# if (mediaId) { #>
                        Titre du média (ID: {{ mediaId.substr(0, 8) }}...)
                    <# } else { #>
                        Titre du média
                    <# } #>
                </h2>
                
                <# if (settings.show_description === 'yes') { #>
                    <div class="siports-media-description" style="color: #6b7280; line-height: 1.8; margin-bottom: 20px;">
                        Description du contenu média. Ceci est une prévisualisation dans l'éditeur Elementor.
                    </div>
                <# } #>
                
                <# if (settings.show_tags === 'yes') { #>
                    <div class="siports-media-tags" style="display: flex; gap: 8px; margin-bottom: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                        <span style="font-size: 18px;">🏷️</span>
                        <span class="siports-tag" style="background: #f3f4f6; padding: 5px 12px; border-radius: 15px; font-size: 13px;">
                            tag1
                        </span>
                        <span class="siports-tag" style="background: #f3f4f6; padding: 5px 12px; border-radius: 15px; font-size: 13px;">
                            tag2
                        </span>
                    </div>
                <# } #>
                
                <# if (settings.show_stats === 'yes') { #>
                    <div class="siports-media-stats" style="display: flex; gap: 20px; padding: 15px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin: 15px 0;">
                        <span style="color: #6b7280; font-size: 14px;">👁️ 1.2K vues</span>
                        <span style="color: #6b7280; font-size: 14px;">❤️ 45 likes</span>
                        <span style="color: #6b7280; font-size: 14px;">📤 12 partages</span>
                    </div>
                <# } #>
                
                <div class="siports-media-meta" style="padding-top: 15px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 14px;">
                    <span>📅 <?php echo date('d/m/Y'); ?></span>
                </div>
            </div>
        </div>
        <?php
    }
}
