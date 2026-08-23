import React from 'react';
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { GripVertical, PlusCircle, Trash2 } from "lucide-react";
import { Checkbox } from './checkbox';
import { Separator } from './separator';
import { Switch } from './switch';

export interface FormFieldData {
    id: string;
    type: 'Text' | 'Number' | 'Date' | 'Dropdown';
    label: string;
    options?: string[];
    required: boolean;
    conditionalOn?: {
        field: string;
        value: string;
    };
}

interface FormFieldEditorProps {
    field: FormFieldData;
    allFields: FormFieldData[];
    onChange: (newData: Partial<FormFieldData>) => void;
    onRemove: () => void;
}

export function FormFieldEditor({ field, allFields, onChange, onRemove }: FormFieldEditorProps) {

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(field.options || [])];
        newOptions[index] = value;
        onChange({ options: newOptions });
    };

    const addOption = () => {
        onChange({ options: [...(field.options || []), 'New Option'] });
    };

    const removeOption = (index: number) => {
        const newOptions = [...(field.options || [])];
        newOptions.splice(index, 1);
        onChange({ options: newOptions });
    };

    const handleConditionalToggle = (checked: boolean) => {
        if (checked) {
            onChange({ conditionalOn: { field: '', value: '' } });
        } else {
            onChange({ conditionalOn: undefined });
        }
    };
    
    const handleConditionalFieldChange = (fieldId: string) => {
        onChange({ conditionalOn: { field: fieldId, value: '' } });
    }

    const handleConditionalValueChange = (value: string) => {
        if (field.conditionalOn) {
            onChange({ conditionalOn: { ...field.conditionalOn, value } });
        }
    }

    const triggerField = allFields.find(f => f.id === field.conditionalOn?.field);

    return (
        <Card className="bg-muted/50">
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                     <button className="p-2 mt-1 cursor-grab">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </button>
                    <div className="flex-grow space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`label-${field.id}`}>Field Label</Label>
                                <Input 
                                    id={`label-${field.id}`} 
                                    value={field.label}
                                    onChange={(e) => onChange({ label: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`type-${field.id}`}>Field Type</Label>
                                <Select 
                                    value={field.type} 
                                    onValueChange={(value) => onChange({ type: value as FormFieldData['type'] })}
                                >
                                    <SelectTrigger id={`type-${field.id}`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Text">Text Input</SelectItem>
                                        <SelectItem value="Number">Number Input</SelectItem>
                                        <SelectItem value="Date">Date Input</SelectItem>
                                        <SelectItem value="Dropdown">Dropdown</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end pb-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`required-${field.id}`}
                                        checked={field.required}
                                        onCheckedChange={(checked) => onChange({ required: !!checked })}
                                    />
                                    <Label htmlFor={`required-${field.id}`}>Required</Label>
                                </div>
                            </div>
                        </div>

                        {field.type === 'Dropdown' && (
                            <div className="space-y-2 pt-4 border-t">
                                <Label>Dropdown Options</Label>
                                <div className="space-y-2">
                                    {(field.options || []).map((option, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <Input 
                                                value={option}
                                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => removeOption(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" size="sm" onClick={addOption}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Option
                                </Button>
                            </div>
                        )}
                        
                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Switch id={`conditional-toggle-${field.id}`} checked={!!field.conditionalOn} onCheckedChange={handleConditionalToggle} />
                                <Label htmlFor={`conditional-toggle-${field.id}`}>Enable Conditional Logic</Label>
                            </div>
                            {field.conditionalOn && (
                                <div className="p-4 border bg-background/50 rounded-md">
                                    <p className="text-sm text-muted-foreground mb-4">Show this field only when...</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Trigger Field</Label>
                                            <Select value={field.conditionalOn.field} onValueChange={handleConditionalFieldChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a field..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allFields.filter(f => f.id !== field.id).map(f => (
                                                        <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         <div className="space-y-2">
                                            <Label>Trigger Value</Label>
                                            {triggerField?.type === 'Dropdown' ? (
                                                <Select value={field.conditionalOn.value} onValueChange={handleConditionalValueChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a value..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {triggerField.options?.map(opt => (
                                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input 
                                                    value={field.conditionalOn.value} 
                                                    onChange={e => handleConditionalValueChange(e.target.value)} 
                                                    placeholder="Enter required value"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                     <Button variant="ghost" size="icon" onClick={onRemove} className="mt-1">
                        <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
