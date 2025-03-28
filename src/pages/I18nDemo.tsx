import React, { useState } from 'react';
import { useTranslation, Trans } from '../i18n/i18n-provider';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '../components/ui/tabs';
import { Globe, Info, Check, AlertCircle, RefreshCw } from 'lucide-react';

const I18nDemo: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const [count, setCount] = useState(0);

  // Sample form data
  const formSections = [
    { id: 'profile', label: t('profile.title') },
    { id: 'tasks', label: t('tasks.title') },
    { id: 'achievements', label: t('achievements.title') }
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('app.name')}</h1>
          <p className="text-muted-foreground">{t('app.tagline')}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {t('settings.language')}:
          </span>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('i18n.usage_examples')}
            </CardTitle>
            <CardDescription>
              {t('i18n.usage_description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold">{t('i18n.basic_usage')}</h3>
              <p className="text-sm px-4 py-2 bg-muted rounded">
                <code>{`const { t } = useTranslation();`}</code><br />
                <code>{`<p>{t('profile.name')}</p>`}</code>
              </p>
              <p className="text-sm">
                {t('i18n.result')}: <span className="font-medium">{t('profile.name')}</span>
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">{t('i18n.with_variables')}</h3>
              <p className="text-sm px-4 py-2 bg-muted rounded">
                <code>{`<p>{t('achievements.progress', { completed: 5, total: 10 })}</p>`}</code>
              </p>
              <p className="text-sm">
                {t('i18n.result')}: <span className="font-medium">{t('achievements.progress', { completed: 5, total: 10 })}</span>
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">{t('i18n.with_components')}</h3>
              <p className="text-sm px-4 py-2 bg-muted rounded">
                <code>{`<Trans components={{ 0: <strong /> }}>`}</code><br />
                <code>{`  This text has <0>bold parts</0> translated.`}</code><br />
                <code>{`</Trans>`}</code>
              </p>
              <p className="text-sm">
                {t('i18n.result')}: <span className="font-medium">
                  <Trans components={{ 0: <strong /> }}>
                    {"This text has <0>bold parts</0> translated."}
                  </Trans>
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {t('i18n.live_examples')}
            </CardTitle>
            <CardDescription>
              {t('i18n.try_changing_language')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="buttons" className="w-full">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="buttons">{t('i18n.buttons')}</TabsTrigger>
                <TabsTrigger value="messages">{t('i18n.messages')}</TabsTrigger>
                <TabsTrigger value="forms">{t('i18n.forms')}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="buttons" className="space-y-4 pt-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">{t('buttons.save')}</Button>
                  <Button variant="secondary">{t('buttons.cancel')}</Button>
                  <Button variant="destructive">{t('buttons.delete')}</Button>
                  <Button variant="outline">{t('buttons.confirm')}</Button>
                  <Button variant="ghost">{t('buttons.back')}</Button>
                  <Button variant="link">{t('buttons.next')}</Button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Button
                    size="sm"
                    onClick={() => setCount(count + 1)}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {t('i18n.counter_button')}
                  </Button>
                  <span>
                    {t('i18n.counter_value', { count })}
                  </span>
                </div>
              </TabsContent>
              
              <TabsContent value="messages" className="space-y-4 pt-4">
                <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-md flex items-start gap-2">
                  <Check className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('messages.success_title')}</p>
                    <p className="text-sm">{t('messages.success_description')}</p>
                  </div>
                </div>
                
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('messages.error_title')}</p>
                    <p className="text-sm">{t('messages.error_description')}</p>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-md flex items-start gap-2">
                  <Info className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('messages.info_title')}</p>
                    <p className="text-sm">{t('messages.info_description')}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="forms" className="space-y-4 pt-4">
                <div className="space-y-3">
                  {formSections.map(section => (
                    <div key={section.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span>{section.label}</span>
                      <Button size="sm" variant="outline">{t('buttons.edit')}</Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {t('i18n.current_language')}: <span className="font-medium">{currentLanguage.toUpperCase()}</span>
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/your-org/mission-fresh" target="_blank" rel="noopener noreferrer">
                {t('i18n.learn_more')}
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default I18nDemo; 