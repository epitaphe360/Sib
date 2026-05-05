import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Save, Eye, Code, Type, Mail, ArrowLeft } from 'lucide-react';

interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  description: string;
  subject: string;
  html_content: string;
  text_content: string;
  variables: string[];
  is_active: boolean;
  updated_at: string;
}

export default function EmailTemplatesManager() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'html' | 'text'>('html');

  // État du formulaire
  const [formData, setFormData] = useState({
    subject: '',
    html_content: '',
    text_content: '',
    is_active: true
  });

  // Charger les templates
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (error) {throw error;}
      setTemplates(data || []);
    } catch (error) {
      console.error('Erreur chargement templates:', error);
      toast.error('Impossible de charger les templates');
    } finally {
      setLoading(false);
    }
  };

  const selectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      subject: template.subject,
      html_content: template.html_content,
      text_content: template.text_content || '',
      is_active: template.is_active
    });
  };

  const handleSave = async () => {
    if (!selectedTemplate) {return;}

    try {
      setSaving(true);

      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: formData.subject,
          html_content: formData.html_content,
          text_content: formData.text_content,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', selectedTemplate.id);

      if (error) {throw error;}

      toast.success('✅ Template enregistré avec succès');
      loadTemplates();

      // Mettre à jour le template sélectionné
      setSelectedTemplate({
        ...selectedTemplate,
        ...formData
      });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('❌ Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Remplacer les variables par des exemples pour la preview
  const getPreviewContent = (content: string) => {
    return content
      .replace(/{{name}}/g, 'Jean Dupont')
      .replace(/{{email}}/g, 'jean.dupont@example.com')
      .replace(/{{level}}/g, 'VIP Premium');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Chargement des templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📧 Gestion des Templates d'Emails</h1>
        <p className="text-gray-600">
          Personnalisez le contenu des emails envoyés automatiquement aux visiteurs
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Liste des templates */}
        <div className="col-span-12 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates disponibles</CardTitle>
              <CardDescription>Sélectionnez un template à modifier</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-green-500 hover:shadow-md ${
                    selectedTemplate?.id === template.id
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm">{template.name}</h3>
                    {template.is_active ? (
                      <Badge variant="default" className="bg-green-500">Actif</Badge>
                    ) : (
                      <Badge variant="secondary">Inactif</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Modifié: {new Date(template.updated_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Éditeur */}
        <div className="col-span-12 lg:col-span-8">
          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {selectedTemplate.name}
                    </CardTitle>
                    <CardDescription>{selectedTemplate.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(previewMode === 'html' ? 'text' : 'html')}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {previewMode === 'html' ? 'Voir texte' : 'Voir HTML'}
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="edit">
                      <Code className="mr-2 h-4 w-4" />
                      Éditer
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Eye className="mr-2 h-4 w-4" />
                      Aperçu
                    </TabsTrigger>
                  </TabsList>

                  {/* Variables disponibles */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      📝 Variables disponibles:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.variables.map((variable) => (
                        <Badge key={variable} variant="outline" className="bg-white">
                          {`{{${variable}}}`}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-blue-700 mt-2">
                      Utilisez ces variables dans votre contenu. Elles seront remplacées automatiquement.
                    </p>
                  </div>

                  <TabsContent value="edit" className="space-y-4">
                    {/* Sujet */}
                    <div>
                      <Label htmlFor="subject">Sujet de l'email</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Entrez le sujet de l'email"
                        className="mt-1"
                      />
                    </div>

                    {/* Contenu HTML */}
                    <div>
                      <Label htmlFor="html_content" className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Contenu HTML
                      </Label>
                      <Textarea
                        id="html_content"
                        value={formData.html_content}
                        onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                        rows={15}
                        className="mt-1 font-mono text-sm"
                        placeholder="Contenu HTML de l'email..."
                      />
                    </div>

                    {/* Contenu texte */}
                    <div>
                      <Label htmlFor="text_content" className="flex items-center gap-2">
                        <Type className="h-4 w-4" />
                        Contenu texte (fallback)
                      </Label>
                      <Textarea
                        id="text_content"
                        value={formData.text_content}
                        onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                        rows={8}
                        className="mt-1"
                        placeholder="Version texte simple de l'email..."
                      />
                    </div>

                    {/* Statut */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded"
                      />
                      <Label htmlFor="is_active" className="cursor-pointer">
                        Template actif (utilisé pour l'envoi d'emails)
                      </Label>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview">
                    <div className="border rounded-lg overflow-hidden">
                      {/* Sujet */}
                      <div className="bg-gray-100 p-3 border-b">
                        <p className="text-xs text-gray-600 mb-1">Sujet:</p>
                        <p className="font-semibold">{getPreviewContent(formData.subject)}</p>
                      </div>

                      {/* Contenu */}
                      <div className="p-4 bg-white max-h-[600px] overflow-y-auto">
                        {previewMode === 'html' ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: getPreviewContent(formData.html_content)
                            }}
                          />
                        ) : (
                          <pre className="whitespace-pre-wrap text-sm font-mono">
                            {getPreviewContent(formData.text_content)}
                          </pre>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-900">
                        ℹ️ Ceci est un aperçu avec des données d'exemple. Les vraies données seront insérées lors de l'envoi.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-gray-400">
                  <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez un template pour commencer l'édition</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
