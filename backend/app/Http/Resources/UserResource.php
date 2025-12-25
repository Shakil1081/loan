<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'permissions' => PermissionResource::collection($this->whenLoaded('permissions')),
            'all_permissions' => $this->when(isset($this->all_permissions), $this->all_permissions),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
