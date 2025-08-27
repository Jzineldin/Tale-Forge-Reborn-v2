import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Info } from 'lucide-react';

interface SubscriptionUpgradeCardProps {
  onCancel?: () => void;
}

const SubscriptionUpgradeCard: React.FC<SubscriptionUpgradeCardProps> = ({ onCancel }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Template Creation Locked
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              Template creation is available for Creator and Master subscribers only.
              Upgrade your subscription to create and share your own story templates!
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium">Template Creation Benefits:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Create custom story templates</li>
            <li>• Share templates with the community</li>
            <li>• Earn credits from template usage</li>
            <li>• Advanced customization options</li>
            <li>• Priority template review</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button className="flex-1">
            Upgrade Subscription
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionUpgradeCard;