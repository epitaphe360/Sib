import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:com.urbaevent/utils/ThemeColor.dart';

/// Écran WebView réutilisable pour les features riches de la plateforme SIB :
/// - Mini-site exposant    → /salons/{slug}/exposants/{id}
/// - Matching B2B          → /matching/advanced
/// - Speed Networking      → /networking/speed
/// - Profil partenaire     → /partner/profile
/// - Statistiques exposant → /exhibitor/dashboard
///
/// Passe automatiquement le token Supabase en cookie pour éviter de
/// redemander la connexion dans la WebView.
class WebViewScreen extends StatefulWidget {
  final String title;
  final String url;
  final String? accessToken;

  const WebViewScreen({
    super.key,
    required this.title,
    required this.url,
    this.accessToken,
  });

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;
  int _loadingProgress = 0;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (progress) {
            setState(() => _loadingProgress = progress);
          },
          onPageStarted: (_) {
            setState(() {
              _isLoading = true;
              _hasError = false;
            });
          },
          onPageFinished: (_) async {
            setState(() => _isLoading = false);
            // Injecter le token Supabase dans localStorage pour l'auto-login
            if (widget.accessToken != null) {
              await _controller.runJavaScript(
                'window.__flutter_access_token = "${widget.accessToken}";'
                'try { localStorage.setItem("sb-access-token", "${widget.accessToken}"); } catch(e) {}',
              );
            }
          },
          onWebResourceError: (_) {
            setState(() {
              _isLoading = false;
              _hasError = true;
            });
          },
        ),
      )
      ..loadRequest(Uri.parse(widget.url));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F2034),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1B365D),
        foregroundColor: Colors.white,
        title: Text(
          widget.title,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white70),
            onPressed: () => _controller.reload(),
            tooltip: 'Actualiser',
          ),
          IconButton(
            icon: const Icon(Icons.open_in_browser, color: Colors.white70),
            onPressed: () => _controller.loadRequest(Uri.parse(widget.url)),
            tooltip: 'Recharger',
          ),
        ],
      ),
      body: Stack(
        children: [
          if (!_hasError)
            WebViewWidget(controller: _controller)
          else
            _ErrorView(
              onRetry: () {
                setState(() => _hasError = false);
                _controller.reload();
              },
            ),

          // Barre de progression
          if (_isLoading && !_hasError)
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: LinearProgressIndicator(
                value: _loadingProgress / 100,
                backgroundColor: Colors.transparent,
                valueColor: AlwaysStoppedAnimation<Color>(ThemeColor.colorAccent),
                minHeight: 3,
              ),
            ),
        ],
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final VoidCallback onRetry;
  const _ErrorView({required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.wifi_off, size: 56, color: Colors.white30),
            const SizedBox(height: 16),
            const Text(
              'Connexion impossible',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            const Text(
              'Vérifiez votre connexion internet et réessayez.',
              style: TextStyle(color: Colors.white54, fontSize: 14),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Réessayer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFC9A84C),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
