import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Filter, X, Calendar, Tag, FolderOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PURCHASE_GROUP_LIST, type PurchaseGroup } from "@/lib/purchase-groups";

export interface ClientFiltersState {
  tags: string[];
  categories: string[];
  inactivityDays: number | null;
  needsFollowup: boolean;
  purchaseGroups: PurchaseGroup[];
}

interface ClientFiltersProps {
  filters: ClientFiltersState;
  onFiltersChange: (filters: ClientFiltersState) => void;
  availableTags: { id: string; label: string; color: string }[];
  availableCategories: string[];
}

export function ClientFilters({ 
  filters, 
  onFiltersChange, 
  availableTags, 
  availableCategories 
}: ClientFiltersProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = 
    filters.tags.length + 
    filters.categories.length + 
    (filters.purchaseGroups?.length || 0) +
    (filters.inactivityDays ? 1 : 0) + 
    (filters.needsFollowup ? 1 : 0);

  const toggleTag = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter(t => t !== tagId)
      : [...filters.tags, tagId];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const togglePurchaseGroup = (groupId: PurchaseGroup) => {
    const current = filters.purchaseGroups || [];
    const newGroups = current.includes(groupId)
      ? current.filter(g => g !== groupId)
      : [...current, groupId];
    onFiltersChange({ ...filters, purchaseGroups: newGroups });
  };

  const clearFilters = () => {
    onFiltersChange({
      tags: [],
      categories: [],
      inactivityDays: null,
      needsFollowup: false,
      purchaseGroups: [],
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            {t('clients.filters.title')}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{t('clients.filters.title')}</h4>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
                  {t('clients.filters.clear')}
                </Button>
              )}
            </div>

            {/* Tags filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Tag className="w-3 h-3" />
                {t('clients.filters.byTags')}
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map(tag => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className={cn(
                      "cursor-pointer text-xs",
                      filters.tags.includes(tag.id) ? tag.color : "bg-muted text-muted-foreground opacity-60"
                    )}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Categories filter */}
            {availableCategories.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm">
                  <FolderOpen className="w-3 h-3" />
                  {t('clients.filters.byCategory')}
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {availableCategories.map(category => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className={cn(
                        "cursor-pointer text-xs",
                        filters.categories.includes(category) 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted text-muted-foreground opacity-60"
                      )}
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase groups filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Users className="w-3 h-3" />
                Grupa zakupowa
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {PURCHASE_GROUP_LIST.map(group => (
                  <Badge
                    key={group.id}
                    variant="secondary"
                    className={cn(
                      "cursor-pointer text-xs gap-1",
                      (filters.purchaseGroups || []).includes(group.id)
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground opacity-60"
                    )}
                    onClick={() => togglePurchaseGroup(group.id)}
                  >
                    {group.emoji} {group.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Inactivity filter */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm">
                <Calendar className="w-3 h-3" />
                {t('clients.filters.byInactivity')}
              </Label>
              <Select
                value={filters.inactivityDays?.toString() || "all"}
                onValueChange={(value) => 
                  onFiltersChange({ 
                    ...filters, 
                    inactivityDays: value === "all" ? null : parseInt(value) 
                  })
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('clients.filters.allClients')}</SelectItem>
                  <SelectItem value="30">{t('clients.filters.inactive30')}</SelectItem>
                  <SelectItem value="60">{t('clients.filters.inactive60')}</SelectItem>
                  <SelectItem value="90">{t('clients.filters.inactive90')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Needs followup filter */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="needsFollowup"
                checked={filters.needsFollowup}
                onCheckedChange={(checked) => 
                  onFiltersChange({ ...filters, needsFollowup: checked === true })
                }
              />
              <Label htmlFor="needsFollowup" className="text-sm cursor-pointer">
                {t('clients.filters.needsFollowup')}
              </Label>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filter badges */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {filters.tags.map(tagId => {
            const tag = availableTags.find(t => t.id === tagId);
            return tag ? (
              <Badge key={tagId} variant="secondary" className={cn("text-xs gap-1", tag.color)}>
                {tag.label}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => toggleTag(tagId)} 
                />
              </Badge>
            ) : null;
          })}
          {filters.categories.map(category => (
            <Badge key={category} variant="secondary" className="text-xs gap-1 bg-primary/20 text-primary">
              {category}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => toggleCategory(category)} 
              />
            </Badge>
          ))}
          {filters.inactivityDays && (
            <Badge variant="secondary" className="text-xs gap-1 bg-orange-100 text-orange-800 dark:bg-orange-900/50">
              {t('clients.filters.inactiveDays', { days: filters.inactivityDays })}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, inactivityDays: null })} 
              />
            </Badge>
          )}
          {filters.needsFollowup && (
            <Badge variant="secondary" className="text-xs gap-1 bg-red-100 text-red-800 dark:bg-red-900/50">
              {t('clients.filters.needsFollowupShort')}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFiltersChange({ ...filters, needsFollowup: false })} 
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
