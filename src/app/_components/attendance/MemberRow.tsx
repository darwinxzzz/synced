type Props = {
    name: string
    memberId: string
    present: boolean
    onToggle: (memberId: string, present: boolean) => void
}

export function MemberRow({ name, memberId, present, onToggle }: Props) {
    return (
        <div className="flex items-center justify-between p-2 border-b">
            <span>{name}</span>
            <input
                type="checkbox"
                checked={present}
                onChange={(e) => onToggle(memberId, e.target.checked)}
            />
        </div>
    )
}